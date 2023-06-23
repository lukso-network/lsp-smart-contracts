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
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
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

/**
 * @title The Core Implementation of LSP0-ERC725Account Standard
 *        https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 * @dev A smart contract account including basic functionalities such as:
 * - Detecting supported standards using ERC165
 *   https://eips.ethereum.org/EIPS/eip-165
 *
 * - Executing several operation on other addresses including creating contracts using ERC725X
 *   https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md
 *
 * - Storing data in a generic way using ERC725Y
 *   https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md
 *
 * - Validating signatures using ERC1271
 *   https://eips.ethereum.org/EIPS/eip-1271
 *
 * - Receiving notification and react on them using LSP1
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md
 *
 * - Secure ownership management using LSP14
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md
 *
 * - Extending the account with new functions and interfaceIds of future standards using LSP17
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md
 *
 * - Verifying calls on the owner to allow unified and standard interaction with the account using LSP20
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md
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
     * - when receiving some native tokens without any additional data.
     * - on empty calls to the contract.
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
     * @notice Achieves the goal of [LSP17-ContractExtension] standard by extending the contract to
     * handle calls of functions that do not exist natively, forwarding the function call to the
     * extension address mapped to the function being called.
     *
     * @dev This function is executed when:
     *    - sending data of length less than 4 bytes to the contract.
     *    - the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - receiving native tokens with some calldata.
     *
     * 1. If the data is equal or longer than 4 bytes, the ERC725Y storage is queried with the following data key:
     *   `[_LSP17_EXTENSION_PREFIX] + <bytes4 (msg.sig)>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}
     *     The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under
     *
     *     This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode,
     *     appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`).
     *     Return what the calls returns, or revert if the call failed
     *
     * @custom:return if the data sent to this function is of length less than 4 bytes (not a function selector)
     *
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    fallback() external payable virtual {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        if (msg.data.length < 4) {
            return;
        }

        _fallbackLSP17Extendable();
    }

    /**
     * @dev Allows a caller to batch different function calls in one call.
     * Perform a delegatecall on self, to call different functions with preserving the context
     * It is not possible to send value along the functions call due to the use of delegatecall.
     *
     * @param data An array of ABI encoded function calls to be called on the contract.
     * @return results An array of values returned by the executed functions.
     */
    function batchCalls(
        bytes[] calldata data
    ) public returns (bytes[] memory results) {
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
     * @dev Executes any call on other addresses.
     *
     * @param operationType The operation to execute: `CALL = 0`, `CREATE = 1` `CREATE2 = 2`, `STATICCALL = 3`, `DELEGATECALL = 4`.
     * @param target The address (smart contract/EOA) to interact with, `target` will be unused if a contract is created (`CREATE` & `CREATE2`).
     * @param value The amount of native tokens to transfer (in Wei).
     * @param data The call data to execute on `target`, or the bytecode of the contract to deploy.
     *
     * @custom:requirements
     * - if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
     * - if the operation type is `STATICCALL` or `DELEGATECALL`, `value` SHOULD be 0.
     * - `target` SHOULD be `address(0)` when deploying a contract.
     * - MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification
     *
     * @custom:events
     * - {Executed} event, when a call is executed under `operationType` 0, 3 and 4
     * - {ContractCreated} event, when a contract is created under `operationType` 1 and 2
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
     * @dev Generic batch executor function that executes any call on other addresses
     *
     * @param operationsType The list of operations type used: `CALL = 0`, `CREATE = 1`, `CREATE2 = 2`, `STATICCALL = 3`, `DELEGATECALL = 4`.
     * @param targets The list of addresses to call. `targets` will be unused if a contract is created (`CREATE` & `CREATE2`).
     * @param values The list of native token amounts to transfer (in Wei).
     * @param datas The list of call data to execute on `targets`, or the creation bytecode of the contracts to deploy.
     *
     * @custom:requirements
     * - The length of the parameters provided MUST be equal
     * - if a `value` is provided, the contract MUST have at least this amount in its balance to execute successfully.
     * - if the operation type is `STATICCALL` or `DELEGATECALL`, `value` SHOULD be 0.
     * - `target` SHOULD be `address(0)` when deploying a contract.
     * - MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * on the owner accordinng to [LSP20-CallVerification] specification
     *
     * @custom:events
     * - {Executed} event, when a call is executed under `operationType` 0, 3 and 4 (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType` 1 and 2 (each iteration)
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
     * @dev Sets singular data for a given `dataKey`
     *
     * @param dataKey The key to retrieve stored value
     * @param dataValue The value to set
     *
     * @custom:requirements
     * - MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification
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
     * @dev Sets array of data for multiple given `dataKeys`
     *
     * @param dataKeys The array of data keys for values to set
     * @param dataValues The array of values to set
     *
     * @custom:requirements
     * - MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification
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
     * @notice Achieves the goal of [LSP1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing
     * transactions and enabling reactions to these actions.
     *
     * The reaction is achieved by having two external contracts (UniversalReceiverDelegates) that react on the whole transaction
     * and on the specific typeId, respectively.
     *
     * The notification is achieved by emitting a {UniversalReceiver} event on the call with the function parameters, call options, and the
     * response of the UniversalReceiverDelegates (URD) contract.
     *
     * @dev The function performs the following steps:
     *
     * 1. Query the ERC725Y storage with the data key `[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY]`.
     *      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.
     *
     *      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.
     *
     *
     * 2. Query the ERC725Y storage with the data key `[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY] + <bytes32 typeId>`.
     *   (Check [LSP2-ERC725YJSONSchema] for encoding the data key)
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
     * - {UniversalReceiver} event.
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
     * @notice Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership transfer process.
     *
     * @dev Sets the address of the `pendingNewOwner` as a pending owner that should call {`acceptOwnership()`} in order to complete
     * the ownership transfer to become the new {`owner()`} of the account.
     *
     * Notifies the pending owner via LSP1Standard by calling {universalReceiver()} on the pending owner if it's
     * an address that supports LSP1.
     *
     * @param pendingNewOwner The address of the new pending owner.
     *
     * @custom:requirements
     * - MUST pass when called by the owner or by an authorized address that passes the verification check performed on the owner according to [LSP20-CallVerification] specification.
     * - When notifying the new owner via LSP1, the `typeId` used MUST be `keccak256('LSP0OwnershipTransferStarted')`.
     * - Pending owner cannot accept ownership in the same tx via the LSP1 hook.
     */
    function transferOwnership(
        address pendingNewOwner
    ) public virtual override(LSP14Ownable2Step, OwnableUnset) {
        address currentOwner = owner();

        // If the caller is the owner perform transferOwnership directly
        if (msg.sender == currentOwner) {
            // set the pending owner
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
            );

            // Require that the owner didn't change after the LSP1 Call
            // (Pending owner didn't automate the acceptOwnership call through LSP1)
            require(
                currentOwner == owner(),
                "LSP14: newOwner MUST accept ownership in a separate transaction"
            );
        } else {
            // If the caller is not the owner, call {lsp20VerifyCall} on the owner
            // Depending on the magicValue returned, a second call is done after transferring ownership
            bool verifyAfter = _verifyCall(currentOwner);

            // Set the pending owner if the call is allowed
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
            );

            // Require that the owner didn't change after the LSP1 Call
            // (Pending owner didn't automate the acceptOwnership call through LSP1)
            require(
                currentOwner == owner(),
                "LSP14: newOwner MUST accept ownership in a separate transaction"
            );

            // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
            // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
            if (verifyAfter) {
                _verifyCallResult(currentOwner, "");
            }
        }
    }

    /**
     * @notice Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership transfer process.
     *
     * @dev Transfer ownership of the contract from the current {`owner()`} to the {`pendingOwner()`}.
     *
     * Once this function is called:
     * - the current {`owner()`} will loose access to the functions restricted to the {`owner()`} only.
     * - the {`pendingOwner()`} will gain access to the functions restricted to the {`owner()`} only.
     *
     * @custom:requirements
     * - MUST be called by the pendingOwner.
     * - When notifying the previous owner via LSP1, the typeId used MUST be `keccak256('LSP0OwnershipTransferred_SenderNotification')`.
     * - When notifying the new owner via LSP1, the typeId used MUST be `keccak256('LSP0OwnershipTransferred_RecipientNotification')`.
     */
    function acceptOwnership() public virtual override {
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
     * @notice Achieves the goal of LSP14Ownable2Step by implementing a 2-step ownership renouncing process.
     *
     * @dev Renounce ownership of the contract in a 2-step process.
     *
     * 1. the first call will initiate the process of renouncing ownership.
     * 2. the second is used as a confirmation and will leave the contract without an owner.
     *
     * MUST pass when called by the owner or by an authorised address that pass the verification check performed on the owner accordinng to [LSP20-CallVerification] specification
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

        // set the pending owner
        LSP14Ownable2Step._renounceOwnership();

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @notice Achieves the goal of ERC165 to detect supported interfaces and LSP17 by
     * checking if the interfaceId being queried is supported on another linked extension.
     *
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`.
     *
     * If the contract doesn't support the `interfaceId`, it forwards the call to the
     * `supportsInterface` extension according to LSP17, and checks if the extension
     * implements the interface defined by `interfaceId`.
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
     *      - Returns the magicValue if the address recovered is the same as the owner, indicating that it was a valid signature.
     *
     *      - If the address is different, it returns the fail value indicating that the signature is not valid.
     *
     * 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:
     *
     *      - If the contract fails or returns the fail value, the {isValidSignature()} on the account returns the fail value, indicating that the signature is not valid.
     *
     *      - If the {isValidSignature()} on the owner returned the magicValue, the {isValidSignature()} on the account returns the magicValue, indicating that it's a valid signature.
     *
     * @param dataHash The hash of the data to be validated.
     * @param signature A signature that can validate the previous parameter (Hash).
     *
     * @return magicValue A bytes4 value that indicates if the signature is valid or not.
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
     *
     * Because the function uses assembly `return()`/`revert()` to terminate the call, it cannot be
     * called before other codes in {fallback()}.
     *
     * Otherwise, the codes after {_fallbackLSP17Extendable()} may never be reached.
     */
    function _fallbackLSP17Extendable() internal virtual override {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found for bytes4(0) return don't revert
        if (msg.sig == bytes4(0) && extension == address(0)) return;

        // if no extension was found for other function selectors, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        // solhint-disable no-inline-assembly
        // if the extension was found, call the extension with the msg.data
        // appended with bytes20(address) and bytes32(msg.value)
        assembly {
            calldatacopy(0, 0, calldatasize())

            // The msg.sender address is shifted to the left by 12 bytes to remove the padding
            // Then the address without padding is stored right after the calldata
            mstore(calldatasize(), shl(96, caller()))

            // The msg.value is stored right after the calldata + msg.sender
            mstore(add(calldatasize(), 20), callvalue())

            // Add 52 bytes for the msg.sender and msg.value appended at the end of the calldata
            let success := call(
                gas(),
                extension,
                0,
                0,
                add(calldatasize(), 52),
                0,
                0
            )

            // Copy the returned data
            returndatacopy(0, 0, returndatasize())

            switch success
            // call returns 0 on failed calls
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
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
     * @dev This function overrides the {ERC725YCore} internal {_setData} function to optimize gas usage by
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
