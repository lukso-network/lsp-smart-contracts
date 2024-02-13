// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

import {
    ILSP1UniversalReceiverDelegate
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol";
import {ILSP9Vault} from "./ILSP9Vault.sol";

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// modules
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {
    LSP14Ownable2Step
} from "@lukso/lsp14-contracts/contracts/LSP14Ownable2Step.sol";
import {
    LSP17Extendable
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extendable.sol";

// constants
import {
    ERC725Y_MsgValueDisallowed,
    ERC725Y_DataKeysValuesLengthMismatch,
    ERC725X_CreateOperationsRequireEmptyRecipientAddress,
    ERC725X_CreateOperationsRequireEmptyRecipientAddress,
    ERC725X_MsgValueDisallowedInStaticCall,
    ERC725X_UnknownOperationType
} from "@erc725/smart-contracts/contracts/errors.sol";
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";

import {
    _LSP6KEY_ADDRESSPERMISSIONS_PREFIX
} from "@lukso/lsp6-contracts/contracts/LSP6Constants.sol";
import {
    _INTERFACEID_LSP9,
    _TYPEID_LSP9_VALUE_RECEIVED,
    _TYPEID_LSP9_OwnershipTransferStarted,
    _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "./LSP9Constants.sol";
import {
    _INTERFACEID_LSP14
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";
import {
    _LSP17_EXTENSION_PREFIX
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";

// errors
import {LSP1DelegateNotAllowedToSetDataKey} from "./LSP9Errors.sol";

import {
    NoExtensionFoundForFunctionSelector
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Errors.sol";

/**
 * @title Core Implementation of LSP9Vault built on top of [ERC725], [LSP1UniversalReceiver]
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by an EOA or by a contract and is able to receive and send assets. Also allows for registering received assets by leveraging the key-value storage.
 */
contract LSP9VaultCore is
    ERC725XCore,
    ERC725YCore,
    LSP14Ownable2Step,
    LSP17Extendable,
    ILSP1UniversalReceiver,
    ILSP9Vault
{
    using ERC165Checker for address;
    using LSP1Utils for address;

    address private _reentrantDelegate;

    /**
     * @dev  Executed:
     * - When receiving some native tokens without any additional data.
     * - On empty calls to the contract.
     *
     * @custom:events {UniversalReceiver} when receiving native tokens.
     */
    receive() external payable virtual {
        if (msg.value != 0) {
            universalReceiver(_TYPEID_LSP9_VALUE_RECEIVED, "");
        }
    }

    /**
     * @notice The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`.
     *
     * @dev Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
     * forwarding the function call to the extension address mapped to the function being called.
     *
     * This function is executed when:
     *    - Sending data of length less than 4 bytes to the contract.
     *    - The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - Receiving native tokens with some calldata.
     *
     * 1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}. The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.
     *
     * 2. If the data sent to this function is of length less than 4 bytes (not a function selector), return.
     *
     * @custom:events {UniversalReceiver} event when receiving native tokens and extension function selector is not found or not payable.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.data.length < 4) {
            // if value is associated with the extension call, use the universalReceiver
            if (msg.value != 0)
                universalReceiver(_TYPEID_LSP9_VALUE_RECEIVED, callData);
            return "";
        }

        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @inheritdoc ILSP9Vault
     *
     * @custom:info It's not possible to send value along the functions call due to the use of `delegatecall`.
     */
    function batchCalls(
        bytes[] calldata data
    ) public virtual override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (result.length != 0) {
                    // The easiest way to bubble the revert reason is using memory via assembly
                    // solhint-disable no-inline-assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(32, result), returndata_size)
                    }
                } else {
                    revert("LSP9: batchCalls reverted");
                }
            }

            results[i] = result;

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc ERC725XCore
     *
     * @custom:requirements
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3).
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2).
     * - {UniversalReceiver} event when receiving native tokens.
     *
     * @custom:info The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP9_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }
        return _execute(operationType, target, value, data);
    }

    /**
     * @inheritdoc ERC725XCore
     *
     * @custom:requirements
     * - The length of the parameters provided must be equal.
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3). (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). (each iteration)
     * - {UniversalReceiver} event when receiving native tokens.
     *
     * @custom:info The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override onlyOwner returns (bytes[] memory) {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP9_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }
        return _executeBatch(operationsType, targets, values, datas);
    }

    /**
     * @inheritdoc ERC725YCore
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {DataChanged} event.
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override {
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();

        bool isURD = _validateAndIdentifyCaller();
        if (isURD) {
            if (
                bytes12(dataKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX ||
                bytes6(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX ||
                bytes12(dataKey) == _LSP17_EXTENSION_PREFIX
            ) {
                revert LSP1DelegateNotAllowedToSetDataKey(dataKey);
            }
        }
        _setData(dataKey, dataValue);
    }

    /**
     * @inheritdoc ERC725YCore
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {DataChanged} event. (on each iteration of setting data)
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override {
        bool isURD = _validateAndIdentifyCaller();
        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();

        for (uint256 i = 0; i < dataKeys.length; ) {
            if (isURD) {
                if (
                    bytes12(dataKeys[i]) ==
                    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX ||
                    bytes6(dataKeys[i]) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX ||
                    bytes12(dataKeys[i]) == _LSP17_EXTENSION_PREFIX
                ) {
                    revert LSP1DelegateNotAllowedToSetDataKey(dataKeys[i]);
                }
            }
            _setData(dataKeys[i], dataValues[i]);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.
     *
     * @dev Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions.
     * The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively.
     *
     * The function performs the following steps:
     *
     * 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].
     *      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.
     *
     *      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.
     *
     *
     * 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.
     *   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.
     *
     *      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.
     *
     * @param typeId The type of call received.
     * @param receivedData The data received.
     *
     * @return returnedValues The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.
     *
     * @custom:events
     * - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes memory receivedData
    ) public payable virtual override returns (bytes memory returnedValues) {
        if (msg.value != 0 && (typeId != _TYPEID_LSP9_VALUE_RECEIVED)) {
            universalReceiver(_TYPEID_LSP9_VALUE_RECEIVED, msg.data);
        }

        bytes memory lsp1DelegateValue = _getData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1DelegateValue)
            );

            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                _reentrantDelegate = universalReceiverDelegate;
                resultDefaultDelegate = ILSP1UniversalReceiverDelegate(
                    universalReceiverDelegate
                ).universalReceiverDelegate(
                        msg.sender,
                        msg.value,
                        typeId,
                        receivedData
                    );
            }
        }

        bytes32 lsp1typeIdDelegateKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );

        bytes memory lsp1TypeIdDelegateValue = _getData(lsp1typeIdDelegateKey);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1TypeIdDelegateValue)
            );

            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                _reentrantDelegate = universalReceiverDelegate;
                resultTypeIdDelegate = ILSP1UniversalReceiverDelegate(
                    universalReceiverDelegate
                ).universalReceiverDelegate(
                        msg.sender,
                        msg.value,
                        typeId,
                        receivedData
                    );
            }
        }

        delete _reentrantDelegate;
        returnedValues = abi.encode(
            resultDefaultDelegate,
            resultTypeIdDelegate
        );
        emit UniversalReceiver(
            msg.sender,
            msg.value,
            typeId,
            receivedData,
            returnedValues
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted].
     * - Pending owner cannot accept ownership in the same tx via the LSP1 hook.
     */
    function transferOwnership(
        address newOwner
    ) public virtual override(LSP14Ownable2Step, OwnableUnset) onlyOwner {
        // set the transfer ownership lock
        _inTransferOwnership = true;

        LSP14Ownable2Step._transferOwnership(newOwner);

        address currentOwner = owner();
        emit OwnershipTransferStarted(currentOwner, newOwner);

        newOwner.notifyUniversalReceiver(
            _TYPEID_LSP9_OwnershipTransferStarted,
            abi.encode(currentOwner, newOwner)
        );

        // reset the transfer ownership lock
        _inTransferOwnership = false;
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements
     * - Only the {pendingOwner} can call this function.
     * - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification].
     * - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].
     */
    function acceptOwnership() public virtual override notInTransferOwnership {
        address previousOwner = owner();

        _acceptOwnership();

        previousOwner.notifyUniversalReceiver(
            _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
            abi.encode(previousOwner, msg.sender)
        );

        msg.sender.notifyUniversalReceiver(
            _TYPEID_LSP9_OwnershipTransferred_RecipientNotification,
            abi.encode(previousOwner, msg.sender)
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     */
    function renounceOwnership()
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
        onlyOwner
    {
        address previousOwner = owner();
        LSP14Ownable2Step._renounceOwnership();

        if (owner() == address(0)) {
            previousOwner.notifyUniversalReceiver(
                _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
                abi.encode(previousOwner, address(0))
            );
        }
    }

    /**
     * @notice Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.
     *
     * @dev Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by
     * checking if the interfaceId being queried is supported on another linked extension.
     *
     * If the contract doesn't support the `interfaceId`, it forwards the call to the
     * `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension
     * implements the interface defined by `interfaceId`.
     *
     * @param interfaceId The interface ID to check if the contract supports it.
     *
     * @return `true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore, LSP17Extendable)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP9 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            super.supportsInterface(interfaceId) ||
            _supportsInterfaceInERC165Extension(interfaceId);
    }

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the `address(0)` will be returned.
     * Forwards the value if the extension is payable.
     *
     * Reverts if there is no extension for the function being called, except for the `bytes4(0)` function selector, which passes even if there is no extension for it.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * `CALL` opcode, passing the `msg.data` appended with the 20 bytes of the {msg.sender} and 32 bytes of the `msg.value`.
     *
     * @custom:hint This function does not forward to the extension contract the `msg.value` received by the contract that inherits `LSP17Extendable`.
     * If you would like to forward the `msg.value` to the extension contract, you can override the code of this internal function as follow:
     *
     * ```solidity
     * (bool success, bytes memory result) = extension.call{value: msg.value}(
     *     abi.encodePacked(callData, msg.sender, msg.value)
     * );
     * ```
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        (
            address extension,
            bool isForwardingValue
        ) = _getExtensionAndForwardValue(msg.sig);

        // if value is associated with the extension call and function selector is not payable, use the universalReceiver
        if (msg.value != 0 && !isForwardingValue)
            universalReceiver(_TYPEID_LSP9_VALUE_RECEIVED, callData);

        // if no extension was found for bytes4(0) return don't revert
        if (msg.sig == bytes4(0) && extension == address(0)) return "";

        // if no extension was found for other function selectors, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call{
            value: isForwardingValue ? msg.value : 0
        }(abi.encodePacked(callData, msg.sender, msg.value));

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }

    /**
     * @dev Returns the extension address stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     */
    function _getExtensionAndForwardValue(
        bytes4 functionSelector
    ) internal view virtual override returns (address, bool) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        bytes memory extensionData = ERC725YCore._getData(
            mappedExtensionDataKey
        );

        // Prevent casting data shorter than 20 bytes to an address to avoid
        // unintentionally calling a different extension, return address(0) instead.
        if (extensionData.length < 20) {
            return (address(0), false);
        }

        // CHECK if the `extensionData` is 21 bytes long
        // - 20 bytes = extension's address
        // - 1 byte `0x01` as a boolean indicating if the contract should forward the value to the extension or not
        if (extensionData.length == 21) {
            // If the last byte is set to `0x01` (`true`)
            // this indicates that the contract should forward the value to the extension
            if (extensionData[20] == 0x01) {
                // Return the address of the extension
                return (address(bytes20(extensionData)), true);
            }
        }

        return (address(bytes20(extensionData)), false);
    }

    /**
     * @dev Internal method restricting the call to the owner of the contract and the UniversalReceiverDelegate
     */
    function _validateAndIdentifyCaller()
        internal
        view
        virtual
        returns (bool isURD)
    {
        if (msg.sender != owner()) {
            require(
                msg.sender == _reentrantDelegate,
                "Only Owner or reentered Universal Receiver Delegate allowed"
            );
            isURD = true;
        }
    }

    /**
     * @dev This function overrides the {ERC725XCore} internal {_execute} function to disable operation type DELEGATECALL (4).
     *
     * @custom:warning Providing operation type DELEGATECALL (4) as argument will result in custom error {ERC725X_UnknownOperationType(4)}
     *
     * @param operationType The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3.
     * @param target The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2).
     * @param value The amount of native tokens to transfer (in Wei).
     * @param data The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.
     */
    function _execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) internal virtual override returns (bytes memory) {
        // CALL
        if (operationType == OPERATION_0_CALL) {
            return _executeCall(target, value, data);
        }

        // Deploy with CREATE
        if (operationType == uint256(OPERATION_1_CREATE)) {
            if (target != address(0)) {
                revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            }
            return _deployCreate(value, data);
        }

        // Deploy with CREATE2
        if (operationType == uint256(OPERATION_2_CREATE2)) {
            if (target != address(0)) {
                revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            }
            return _deployCreate2(value, data);
        }

        // STATICCALL
        if (operationType == uint256(OPERATION_3_STATICCALL)) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInStaticCall();
            return _executeStaticCall(target, data);
        }

        revert ERC725X_UnknownOperationType(operationType);
    }
}
