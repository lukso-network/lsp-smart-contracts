// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP0ERC725Account} from "./ILSP0ERC725Account.sol";
import {
    ILSP1UniversalReceiver
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// modules
import {
    ERC725YCore,
    IERC725Y
} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {
    ERC725XCore,
    IERC725X
} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {LSP17Extendable} from "../LSP17ContractExtension/LSP17Extendable.sol";
import {
    LSP20CallVerification
} from "../LSP20CallVerification/LSP20CallVerification.sol";

// constants
import "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_LSP0,
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE,
    _TYPEID_LSP0_OwnershipTransferStarted,
    _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP0_OwnershipTransferred_RecipientNotification
} from "../LSP0ERC725Account/LSP0Constants.sol";
import {
    _INTERFACEID_LSP1,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP14} from "../LSP14Ownable2Step/LSP14Constants.sol";

import {
    _LSP17_EXTENSION_PREFIX
} from "../LSP17ContractExtension/LSP17Constants.sol";
import {
    _INTERFACEID_LSP20_CALL_VERIFICATION
} from "../LSP20CallVerification/LSP20Constants.sol";

// errors
import {
    ERC725Y_DataKeysValuesLengthMismatch
} from "@erc725/smart-contracts/contracts/errors.sol";
import {
    NoExtensionFoundForFunctionSelector
} from "../LSP17ContractExtension/LSP17Errors.sol";

import {
    LSP14MustAcceptOwnershipInSeparateTransaction
} from "../LSP14Ownable2Step/LSP14Errors.sol";

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
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    receive() external payable virtual {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }
    }

    // solhint-disable no-complex-fallback

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
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        if (msg.data.length < 4) {
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
    ) public virtual returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (result.length > 0) {
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
     * @inheritdoc IERC725X
     *
     * @custom:requirements
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration)
     * - {ValueReceived} event when receiving native tokens.
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override returns (bytes memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == _owner) {
            return ERC725XCore._execute(operationType, target, value, data);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(_owner);

        // Perform the execution
        bytes memory result = ERC725XCore._execute(
            operationType,
            target,
            value,
            data
        );

        // if verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        if (verifyAfter) {
            LSP20CallVerification._verifyCallResult(_owner, abi.encode(result));
        }

        return result;
    }

    /**
     * @inheritdoc IERC725X
     *
     * @custom:requirements
     * - The length of the parameters provided must be equal.
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration)
     * - {ValueReceived} event when receiving native tokens.
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override returns (bytes[] memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == _owner) {
            return
                ERC725XCore._executeBatch(
                    operationsType,
                    targets,
                    values,
                    datas
                );
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(_owner);

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
                _owner,
                abi.encode(results)
            );
        }

        return results;
    }

    /**
     * @inheritdoc IERC725Y
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {ValueReceived} event when receiving native tokens.
     * - {DataChanged} event.
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == _owner) {
            return _setData(dataKey, dataValue);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after setting data
        bool verifyAfter = _verifyCall(_owner);

        _setData(dataKey, dataValue);

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @inheritdoc IERC725Y
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {ValueReceived} event when receiving native tokens.
     * - {DataChanged} event. (on each iteration of setting data)
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        address _owner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == _owner) {
            for (uint256 i = 0; i < dataKeys.length; ) {
                _setData(dataKeys[i], dataValues[i]);

                unchecked {
                    ++i;
                }
            }

            return;
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after setting data
        bool verifyAfter = _verifyCall(_owner);

        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            unchecked {
                ++i;
            }
        }

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
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
     * - {ValueReceived} when receiving native tokens.
     * - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata receivedData
    ) public payable virtual returns (bytes memory returnedValues) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY}
        bytes memory lsp1DelegateValue = _getData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1DelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultDefaultDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        // Generate the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes32 lsp1typeIdDelegateKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes memory lsp1TypeIdDelegateValue = _getData(lsp1typeIdDelegateKey);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1TypeIdDelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultTypeIdDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
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
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
            );

            // reset the transfer ownership lock
            _inTransferOwnership = false;
        } else {
            // If the caller is not the owner, call {lsp20VerifyCall} on the owner
            // Depending on the magicValue returned, a second call is done after transferring ownership
            bool verifyAfter = _verifyCall(currentOwner);

            // set the transfer ownership lock
            _inTransferOwnership = true;

            // Set the pending owner if the call is allowed
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
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
    function acceptOwnership() public virtual override NotInTransferOwnership {
        address previousOwner = owner();

        _acceptOwnership();

        // notify the previous owner if supports LSP1
        previousOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
            ""
        );

        // notify the pending owner if supports LSP1
        msg.sender.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_RecipientNotification,
            ""
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     *
     */
    function renounceOwnership()
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
    {
        address _owner = owner();

        // If the caller is the owner perform renounceOwnership directly
        if (msg.sender == _owner) {
            return LSP14Ownable2Step._renounceOwnership();
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after transferring ownership
        bool verifyAfter = _verifyCall(_owner);

        address previousOwner = owner();
        LSP14Ownable2Step._renounceOwnership();

        if (owner() == address(0)) {
            previousOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
                ""
            );
        }

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @notice Checking if this contract supports the interface defined by the bytes4 interface ID `interfaceId`.
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
     *      - Returns the `magicValue` if the address recovered is the same as the owner, indicating that it was a valid signature.
     *
     *      - If the address is different, it returns the fail value indicating that the signature is not valid.
     *
     * 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:
     *
     *      - If the contract fails or returns the fail value, the {isValidSignature()} on the account returns the fail value, indicating that the signature is not valid.
     *
     *      - If the {isValidSignature()} on the owner returned the `magicValue`, the {isValidSignature()} on the account returns the `magicValue`, indicating that it's a valid signature.
     *
     * @param dataHash The hash of the data to be validated.
     * @param signature A signature that can validate the previous parameter (Hash).
     *
     * @return magicValue A `bytes4` value that indicates if the signature is valid or not.
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual returns (bytes4 magicValue) {
        address _owner = owner();

        // If owner is a contract
        if (_owner.code.length > 0) {
            (bool success, bytes memory result) = _owner.staticcall(
                abi.encodeWithSelector(
                    IERC1271.isValidSignature.selector,
                    dataHash,
                    signature
                )
            );

            bool isValid = (success &&
                result.length == 32 &&
                abi.decode(result, (bytes32)) == bytes32(_ERC1271_MAGICVALUE));

            return isValid ? _ERC1271_MAGICVALUE : _ERC1271_FAILVALUE;
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
            // return the ERC1271 magic value. Otherwise, return the ERC1271 fail value
            // matches the address of the owner, otherwise return fail value
            return
                recoveredAddress == _owner
                    ? _ERC1271_MAGICVALUE
                    : _ERC1271_FAILVALUE;
        }
    }

    // Internal functions

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtension} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the `address(0)` will be returned.
     *
     * Reverts if there is no extension for the function being called, except for the bytes4(0) function
     * selector, which passes even if there is no extension for it.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the `msg.data` appended with the 20 bytes of the `msg.sender` and
     * 32 bytes of the `msg.value`
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found for bytes4(0) return don't revert
        if (msg.sig == bytes4(0) && extension == address(0)) return "";

        // if no extension was found for other function selectors, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

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
     * @dev Returns the extension address stored under the following data key:
     * {_LSP17_EXTENSION_PREFIX + <bytes4>} (Check [LSP2-ERC725YJSONSchema] for encoding the data key)
     *
     * If no extension is stored, returns the address(0)
     */
    function _getExtension(
        bytes4 functionSelector
    ) internal view virtual override returns (address) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension stored under the generated data key
        address extension = address(
            bytes20(ERC725YCore._getData(mappedExtensionDataKey))
        );

        return extension;
    }

    /**
     * @custom:events {DataChanged} event with only the first 256 bytes of {dataValue}.
     *
     * @dev This function overrides the {ERC725YCore} internal {_setData} function to optimize gas usage by emitting only the first 256 bytes of the `dataValue`.
     *
     * @param dataKey The key to store the data value under.
     * @param dataValue The data value to be stored.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        ERC725YCore._store[dataKey] = dataValue;
        emit DataChanged(
            dataKey,
            dataValue.length <= 256
                ? dataValue
                : BytesLib.slice(dataValue, 0, 256)
        );
    }
}
