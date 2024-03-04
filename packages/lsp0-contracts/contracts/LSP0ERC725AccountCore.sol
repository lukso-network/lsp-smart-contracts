// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP0ERC725Account} from "./ILSP0ERC725Account.sol";
import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

import {
    ILSP1UniversalReceiverDelegate as ILSP1Delegate
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol";

// libraries
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {
    LSP14Ownable2Step
} from "@lukso/lsp14-contracts/contracts/LSP14Ownable2Step.sol";
import {
    LSP17Extendable
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extendable.sol";
import {
    LSP20CallVerification
} from "@lukso/lsp20-contracts/contracts/LSP20CallVerification.sol";

// constants
import {
    _INTERFACEID_LSP0,
    _INTERFACEID_ERC1271,
    _ERC1271_SUCCESSVALUE,
    _ERC1271_FAILVALUE,
    _TYPEID_LSP0_VALUE_RECEIVED,
    _TYPEID_LSP0_OwnershipTransferStarted,
    _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP0_OwnershipTransferred_RecipientNotification
} from "./LSP0Constants.sol";
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import {
    _INTERFACEID_LSP14
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";

import {
    _LSP17_EXTENSION_PREFIX
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";
import {
    _INTERFACEID_LSP20_CALL_VERIFICATION
} from "@lukso/lsp20-contracts/contracts/LSP20Constants.sol";

// errors
import {
    ERC725Y_DataKeysValuesLengthMismatch,
    ERC725Y_DataKeysValuesEmptyArray
} from "@erc725/smart-contracts/contracts/errors.sol";
import {
    NoExtensionFoundForFunctionSelector
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Errors.sol";

/**
 * @title The Core Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
abstract contract LSP0ERC725AccountCore is
    ERC725XCore,
    ERC725YCore,
    IERC1271,
    ILSP0ERC725Account,
    ILSP1UniversalReceiver,
    LSP14Ownable2Step,
    LSP17Extendable,
    LSP20CallVerification
{
    using ERC165Checker for address;
    using LSP1Utils for address;
    using Address for address;

    /**
     * @dev Executed:
     * - When receiving some native tokens without any additional data.
     * - On empty calls to the contract.
     *
     * @custom:info This function internally delegates the handling of native tokens to the {universalReceiver} function
     * passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and an empty bytes array as received data.
     *
     * @custom:events Emits a {UniversalReceiver} event when the `universalReceiver` logic is executed upon receiving native tokens.
     */
    receive() external payable virtual {
        if (msg.value != 0) {
            universalReceiver(_TYPEID_LSP0_VALUE_RECEIVED, "");
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
     * @custom:info Whenever the call is associated with native tokens, the function will delegate the handling of native tokens internally to the {universalReceiver} function
     * passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and the calldata as received data, except when the native token will be sent directly to the extension.
     *
     * @custom:events {UniversalReceiver} event when receiving native tokens and extension function selector is not found or not payable.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.data.length < 4) {
            // if value is associated with the extension call, use the universalReceiver
            if (msg.value != 0) {
                universalReceiver(_TYPEID_LSP0_VALUE_RECEIVED, callData);
            }
            return "";
        }

        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @inheritdoc ILSP0ERC725Account
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
                    revert("LSP0: batchCalls reverted");
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
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4).
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2).
     * - {UniversalReceiver} event when receiving native tokens.
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override returns (bytes memory) {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP0_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }

        address accountOwner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == accountOwner) {
            return ERC725XCore._execute(operationType, target, value, data);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the returnedStatus, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(accountOwner);

        // Perform the execution
        bytes memory result = ERC725XCore._execute(
            operationType,
            target,
            value,
            data
        );

        // if verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        if (verifyAfter) {
            LSP20CallVerification._verifyCallResult(
                accountOwner,
                abi.encode(result)
            );
        }

        return result;
    }

    /**
     * @inheritdoc ERC725XCore
     *
     * @custom:requirements
     * - The length of the parameters provided must be equal.
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:warning
     * - The `msg.value` should not be trusted for any method called within the batch with `operationType`: `DELEGATECALL` (4).
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration)
     * - {UniversalReceiver} event when receiving native tokens.
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override returns (bytes[] memory) {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP0_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }

        address accountOwner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == accountOwner) {
            return
                ERC725XCore._executeBatch(
                    operationsType,
                    targets,
                    values,
                    datas
                );
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the returnedStatus, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(accountOwner);

        // Perform the execution
        bytes[] memory results = ERC725XCore._executeBatch(
            operationsType,
            targets,
            values,
            datas
        );

        // if verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        if (verifyAfter) {
            LSP20CallVerification._verifyCallResult(
                accountOwner,
                abi.encode(results)
            );
        }

        return results;
    }

    /**
     * @inheritdoc ERC725YCore
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {UniversalReceiver} event when receiving native tokens.
     * - {DataChanged} event.
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP0_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }

        address accountOwner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == accountOwner) {
            return _setData(dataKey, dataValue);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the returnedStatus, a second call is done after setting data
        bool verifyAfter = _verifyCall(accountOwner);

        _setData(dataKey, dataValue);

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(accountOwner, "");
        }
    }

    /**
     * @inheritdoc ERC725YCore
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {UniversalReceiver} event when receiving native tokens.
     * - {DataChanged} event. (on each iteration of setting data)
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP0_VALUE_RECEIVED,
                abi.encodePacked(msg.sig),
                ""
            );
        }

        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        if (dataKeys.length == 0) {
            revert ERC725Y_DataKeysValuesEmptyArray();
        }

        address accountOwner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == accountOwner) {
            for (uint256 i; i < dataKeys.length; ) {
                _setData(dataKeys[i], dataValues[i]);

                unchecked {
                    ++i;
                }
            }

            return;
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the returnedStatus, a second call is done after setting data
        bool verifyAfter = _verifyCall(accountOwner);

        for (uint256 i; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            unchecked {
                ++i;
            }
        }

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(accountOwner, "");
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
     * This function delegates internally the handling of native tokens to the {universalReceiver} function itself passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and the calldata as received data.
     *
     * @param typeId The type of call received.
     * @param receivedData The data received.
     *
     * @return returnedValues The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.
     *
     * @custom:events
     * - {UniversalReceiver} when receiving native tokens.
     * - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes memory receivedData
    ) public payable virtual override returns (bytes memory returnedValues) {
        if (msg.value != 0 && (typeId != _TYPEID_LSP0_VALUE_RECEIVED)) {
            universalReceiver(_TYPEID_LSP0_VALUE_RECEIVED, msg.data);
        }

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY}
        bytes memory lsp1DelegateValue = _getData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address lsp1Delegate = address(bytes20(lsp1DelegateValue));

            // Checking LSP1 InterfaceId support
            if (
                lsp1Delegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                resultDefaultDelegate = ILSP1Delegate(lsp1Delegate)
                    .universalReceiverDelegate(
                        msg.sender,
                        msg.value,
                        typeId,
                        receivedData
                    );
            }
        }

        // Generate the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX + <bytes32 typeId>}
        bytes32 lsp1typeIdDelegateKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX + <bytes32 typeId>}
        bytes memory lsp1TypeIdDelegateValue = _getData(lsp1typeIdDelegateKey);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address lsp1Delegate = address(bytes20(lsp1TypeIdDelegateValue));

            // Checking LSP1 InterfaceId support
            if (
                lsp1Delegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                resultTypeIdDelegate = ILSP1Delegate(lsp1Delegate)
                    .universalReceiverDelegate(
                        msg.sender,
                        msg.value,
                        typeId,
                        receivedData
                    );
            }
        }

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
        address pendingNewOwner
    ) public virtual override(LSP14Ownable2Step, OwnableUnset) {
        address currentOwner = owner();

        // If the caller is the owner perform transferOwnership directly
        if (msg.sender == currentOwner) {
            // set the transfer ownership lock
            _inTransferOwnership = true;

            // set the pending owner
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.notifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                abi.encode(currentOwner, pendingNewOwner)
            );

            // reset the transfer ownership lock
            _inTransferOwnership = false;
        } else {
            // If the caller is not the owner, call {lsp20VerifyCall} on the owner
            // Depending on the returnedStatus, a second call is done after transferring ownership
            bool verifyAfter = _verifyCall(currentOwner);

            // set the transfer ownership lock
            _inTransferOwnership = true;

            // Set the pending owner if the call is allowed
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.notifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                abi.encode(currentOwner, pendingNewOwner)
            );

            // reset the transfer ownership lock
            _inTransferOwnership = false;

            // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
            // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
            if (verifyAfter) {
                _verifyCallResult(currentOwner, "");
            }
        }
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
        address pendingOwnerAddress = pendingOwner();

        bool verifyAfter;

        if (msg.sender != pendingOwnerAddress) {
            // If the caller is not the owner, call {lsp20VerifyCall} on the pending owner
            // Depending on the successStatus returned, a second call is done after transferring ownership
            verifyAfter = _verifyCall(pendingOwnerAddress);

            _setOwner(pendingOwnerAddress);
            delete _pendingOwner;
            delete _renounceOwnershipStartedAt;
        } else {
            _acceptOwnership();
        }

        // notify the previous owner if supports LSP1
        previousOwner.notifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
            abi.encode(previousOwner, pendingOwnerAddress)
        );

        // notify the pending owner if supports LSP1
        pendingOwnerAddress.notifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_RecipientNotification,
            abi.encode(previousOwner, pendingOwnerAddress)
        );

        // If msg.sender != pendingOwnerAddress & verifyAfter is true, Call {lsp20VerifyCallResult} on the new owner
        // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(pendingOwnerAddress, "");
        }
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner or an address allowed by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     *
     */
    function renounceOwnership()
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
    {
        address accountOwner = owner();

        // If the caller is the owner perform renounceOwnership directly
        if (msg.sender == accountOwner) {
            address previousOwner = owner();
            LSP14Ownable2Step._renounceOwnership();

            if (owner() == address(0)) {
                previousOwner.notifyUniversalReceiver(
                    _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
                    abi.encode(accountOwner, address(0))
                );
            }
        } else {
            // If the caller is not the owner, call {lsp20VerifyCall} on the owner
            // Depending on the returnedStatus, a second call is done after transferring ownership
            bool verifyAfter = _verifyCall(accountOwner);

            address previousOwner = owner();
            LSP14Ownable2Step._renounceOwnership();

            if (owner() == address(0)) {
                previousOwner.notifyUniversalReceiver(
                    _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
                    abi.encode(accountOwner, address(0))
                );
            }

            // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
            // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
            if (verifyAfter) {
                _verifyCallResult(accountOwner, "");
            }
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
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFICATION ||
            super.supportsInterface(interfaceId) ||
            LSP17Extendable._supportsInterfaceInERC165Extension(interfaceId);
    }

    /**
     * @notice Achieves the goal of [EIP-1271] by validating signatures of smart contracts
     * according to their own logic.
     *
     * @dev Handles two cases:
     *
     * 1. If the owner is an EOA, recovers an address from the hash and the signature provided:
     *
     *      - Returns the `_ERC1271_SUCCESSVALUE` if the address recovered is the same as the owner, indicating that it was a valid signature.
     *
     *      - If the address is different, it returns the `_ERC1271_FAILVALUE` indicating that the signature is not valid.
     *
     * 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:
     *
     *      - If the contract fails or returns the `_ERC1271_FAILVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_FAILVALUE`, indicating that the signature is not valid.
     *
     *      - If the {isValidSignature()} on the owner returned the `_ERC1271_SUCCESSVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_SUCCESSVALUE`, indicating that it's a valid signature.
     *
     * @param dataHash The hash of the data to be validated.
     * @param signature A signature that can validate the previous parameter (Hash).
     *
     * @return returnedStatus A `bytes4` value that indicates if the signature is valid or not.
     *
     * @custom:warning This function does not enforce by default the inclusion of the address of this contract in the signature digest.
     * It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign.
     * To ensure that a signature is valid for a specific LSP0ERC725Account and prevent signatures from the same EOA to be replayed
     * across different LSP0ERC725Accounts.
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual override returns (bytes4 returnedStatus) {
        address _owner = owner();

        // If owner is a contract
        if (_owner.code.length != 0) {
            (bool success, bytes memory result) = _owner.staticcall(
                abi.encodeWithSelector(
                    IERC1271.isValidSignature.selector,
                    dataHash,
                    signature
                )
            );

            bool isValid = (success &&
                result.length == 32 &&
                abi.decode(result, (bytes32)) ==
                bytes32(_ERC1271_SUCCESSVALUE));

            return isValid ? _ERC1271_SUCCESSVALUE : _ERC1271_FAILVALUE;
        }
        // If owner is an EOA
        else {
            // if isValidSignature fail, the error is catched in returnedError
            (address recoveredAddress, ECDSA.RecoverError returnedError) = ECDSA
                .tryRecover(dataHash, signature);

            // if recovering throws an error, return the fail value
            if (returnedError != ECDSA.RecoverError.NoError)
                return _ERC1271_FAILVALUE;

            // if recovering is successful and the recovered address matches the owner's address,
            // return the ERC1271 success value. Otherwise, return the ERC1271 fail value
            // matches the address of the owner, otherwise return fail value
            return
                recoveredAddress == _owner
                    ? _ERC1271_SUCCESSVALUE
                    : _ERC1271_FAILVALUE;
        }
    }

    // Internal functions

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the `address(0)` will be returned.
     * Forwards the value sent with the call to the extension if the function selector is mapped to a payable extension.
     *
     * Reverts if there is no extension for the function being called, except for the `bytes4(0)` function selector, which passes even if there is no extension for it.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * `CALL` opcode, passing the `msg.data` appended with the 20 bytes of the {msg.sender} and 32 bytes of the `msg.value`.
     *
     * @custom:hint If you would like to forward the `msg.value` to the extension contract, you should store an additional `0x01` byte after the address of the extension under the corresponding LSP17 data key.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        (
            address extension,
            bool isForwardingValue
        ) = _getExtensionAndForwardValue(msg.sig);

        // if value is associated with the extension call and extension function selector is not payable, use the universalReceiver
        if (msg.value != 0 && !isForwardingValue) {
            universalReceiver(_TYPEID_LSP0_VALUE_RECEIVED, callData);
        }

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
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }

    /**
     * @dev Returns the extension address and the boolean indicating whether to forward the value received to the extension, stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     * - If the stored value is 20 bytes, return false for the boolean
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
}
