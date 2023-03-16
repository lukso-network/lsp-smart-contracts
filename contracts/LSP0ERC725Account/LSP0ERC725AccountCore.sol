// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP20CallVerification} from "../LSP20CallVerification/ILSP20CallVerification.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {GasLib} from "../Utils/GasLib.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {LSP17Extendable} from "../LSP17ContractExtension/LSP17Extendable.sol";
import {LSP20CallVerification} from "../LSP20CallVerification/LSP20CallVerification.sol";

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

import {_LSP17_EXTENSION_PREFIX} from "../LSP17ContractExtension/LSP17Constants.sol";

// errors
import "@erc725/smart-contracts/contracts/errors.sol";
import "../LSP17ContractExtension/LSP17Errors.sol";

/**
 * @title Core Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountCore is
    ERC725XCore,
    ERC725YCore,
    IERC1271,
    ILSP1UniversalReceiver,
    LSP14Ownable2Step,
    LSP17Extendable,
    LSP20CallVerification
{
    using ERC165Checker for address;
    using LSP1Utils for address;
    using Address for address;

    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of native tokens received
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executed:
     *     - when receiving some native tokens without any additional data.
     *     - on empty calls to the contract.
     */
    receive() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
    }

    // solhint-disable no-complex-fallback

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Forwards the call to an extension contract (address). This address can be retrieved from
     * the ERC725Y data key-value store using the data key below (function selector appended to the prefix):
     *_LSP17_FALLBACK_EXTENSIONS_HANDLER_ + <function-selector>
     * If there is no extension stored under the data key, return.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * If the msg.data is shorter than 4 bytes do not check for an extension and return
     *
     * Executed when:
     * - the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     * - receiving native tokens with some calldata.
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        if (msg.data.length < 4) return;

        _fallbackLSP17Extendable();
    }

    /**
     * @dev Receives and executes a batch of function calls on this contract.
     */
    function batchCalls(bytes[] calldata data) public returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; i = GasLib.uncheckedIncrement(i)) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);

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
        }
    }

    /**
     * @param operationType The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3 DELEGATECALL = 4
     * @param target The smart contract or address to interact with, `to` will be unused if a contract is created (operation 1 and 2)
     * @param value The amount of native tokens to transfer (in Wei).
     * @param data The call data, or the bytecode of the contract to deploy
     * @dev Executes any call on other addresses.
     *
     * MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * by LSP20 - CallVerification specification
     *
     * Emits a {Executed} event, when a call is executed under `operationType` 0, 3 and 4
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2
     * Emits a {ValueReceived} event, when receives native token
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override returns (bytes memory) {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);

        address _owner = owner();

        if (msg.sender == _owner) return _execute(operationType, target, value, data);

        // perform reverse verification if the caller is not the owner
        bool verifyAfter = _verifyCall(_owner);
        bytes memory result = _execute(operationType, target, value, data);
        if (verifyAfter) _verifyCallResult(_owner, result);

        return result;
    }

    /**
     * @inheritdoc ERC725XCore
     *
     * MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * by LSP20 - CallVerification specification
     *
     * Emits a {ValueReceived} event when receiving native tokens.
     */
    function execute(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override returns (bytes[] memory) {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);

        address _owner = owner();

        if (msg.sender == _owner) return _execute(operationsType, targets, values, datas);

        // perform reverse verification if the caller is not the owner
        bool verifyAfter = _verifyCall(_owner);
        bytes[] memory results = _execute(operationsType, targets, values, datas);
        if (verifyAfter) _verifyCallResult(_owner, abi.encode(results));

        return results;
    }

    /**
     * @notice Sets singular data for a given `dataKey`
     * @param dataKey The key to retrieve stored value
     * @param dataValue The value to set
     *
     * MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * by LSP20 - CallVerification specification
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) public virtual override {
        address _owner = owner();

        if (msg.sender == _owner) return _setData(dataKey, dataValue);

        // perform reverse verification if the caller is not the owner
        bool verifyAfter = _verifyCall(_owner);
        _setData(dataKey, dataValue);

        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) _verifyCallResult(_owner, "");
    }

    /**
     * @param dataKeys The array of data keys for values to set
     * @param dataValues The array of values to set
     * @dev Sets array of data for multiple given `dataKeys`
     *
     * MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * by LSP20 - CallVerification specification
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory dataKeys, bytes[] memory dataValues) public virtual override {
        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch(dataKeys.length, dataValues.length);
        }

        address _owner = owner();

        if (msg.sender == _owner) {
            for (uint256 i = 0; i < dataKeys.length; i = _uncheckedIncrementERC725Y(i)) {
                _setData(dataKeys[i], dataValues[i]);
            }

            return;
        }

        // perform reverse verification if the caller is not the owner
        bool verifyAfter = _verifyCall(_owner);
        for (uint256 i = 0; i < dataKeys.length; i = _uncheckedIncrementERC725Y(i)) {
            _setData(dataKeys[i], dataValues[i]);
        }

        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) _verifyCallResult(_owner, "");
    }

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * Forwards the call to the addresses stored in the ERC725Y storage under the LSP1UniversalReceiverDelegate
     * Key and the typeId Key (param) respectively. The call will be discarded if no addresses were set.
     *
     * @param typeId The type of call received.
     * @param receivedData The data received.
     * @return returnedValues The ABI encoded return value of the LSP1UniversalReceiverDelegate call
     * and the LSP1TypeIdDelegate call.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata receivedData
    ) public payable virtual returns (bytes memory returnedValues) {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (universalReceiverDelegate.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
                resultDefaultDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
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
            address universalReceiverDelegate = address(bytes20(lsp1TypeIdDelegateValue));

            if (universalReceiverDelegate.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
                resultTypeIdDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        returnedValues = abi.encode(resultDefaultDelegate, resultTypeIdDelegate);
        emit UniversalReceiver(msg.sender, msg.value, typeId, receivedData, returnedValues);
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @dev same as ILSP14.transferOwnership with the additional requirement:
     * Requirements:
     *
     * - MUST pass when called by the owner or by an authorised address that pass the verification check performed
     * by LSP20 - CallVerification specification
     *
     * - When notifying the new owner via LSP1, the typeId used MUST be keccak256('LSP0OwnershipTransferStarted')
     */
    function transferOwnership(
        address newOwner
    ) public virtual override(LSP14Ownable2Step, OwnableUnset) {
        address currentOwner = owner();

        if (msg.sender == currentOwner) {
            LSP14Ownable2Step._transferOwnership(newOwner);
            emit OwnershipTransferStarted(currentOwner, newOwner);
            newOwner.tryNotifyUniversalReceiver(_TYPEID_LSP0_OwnershipTransferStarted, "");
        } else {
            bool verifyAfter = _verifyCall(currentOwner);
            LSP14Ownable2Step._transferOwnership(newOwner);
            emit OwnershipTransferStarted(currentOwner, newOwner);
            newOwner.tryNotifyUniversalReceiver(_TYPEID_LSP0_OwnershipTransferStarted, "");

            require(
                currentOwner == owner(),
                "LSP14: newOwner MUST accept ownership in a separate transaction"
            );

            // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
            if (verifyAfter) _verifyCallResult(currentOwner, "");
        }

        require(
            currentOwner == owner(),
            "LSP14: newOwner MUST accept ownership in a separate transaction"
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @dev same as ILSP14.acceptOwnership with the additional requirement:
     *
     * Requirements:
     * - when notifying the previous owner via LSP1, the typeId used MUST be keccak256('LSP0OwnershipTransferred_SenderNotification')
     * - when notifying the new owner via LSP1, the typeId used MUST be keccak256('LSP0OwnershipTransferred_RecipientNotification')
     */
    function acceptOwnership() public virtual override {
        address previousOwner = owner();

        _acceptOwnership();

        previousOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
            ""
        );

        msg.sender.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_RecipientNotification,
            ""
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @dev MUST pass when called by the owner or by an address allowed by the owner as per
     * LSP20 - CallVerification specification
     */
    function renounceOwnership() public virtual override(LSP14Ownable2Step, OwnableUnset) {
        address _owner = owner();

        if (msg.sender == _owner) return LSP14Ownable2Step._renounceOwnership();

        bool verifyAfter = _verifyCall(_owner);
        LSP14Ownable2Step._renounceOwnership();

        // The renounceOwnership function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) _verifyCallResult(_owner, "");
    }

    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`.
     *
     * If the contract doesn't support the `interfaceId`, it forwards the call to the
     * `supportsInterface` extension according to LSP17, and checks if the extension
     * implements the interface defined by `interfaceId`.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC725XCore, ERC725YCore, LSP17Extendable) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            super.supportsInterface(interfaceId) ||
            _supportsInterfaceInERC165Extension(interfaceId);
    }

    /**
     * @notice Checks if an owner signed `_data`.
     * ERC1271 interface.
     *
     * @param dataHash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
     * @param signature owner's signature(s) of the data
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual returns (bytes4 magicValue) {
        address _owner = owner();

        // If owner is a contract
        if (_owner.code.length > 0) {
            (bool success, bytes memory result) = _owner.staticcall(
                abi.encodeWithSelector(IERC1271.isValidSignature.selector, dataHash, signature)
            );

            bool isValid = (success &&
                result.length == 32 &&
                abi.decode(result, (bytes32)) == bytes32(_ERC1271_MAGICVALUE));

            return isValid ? _ERC1271_MAGICVALUE : _ERC1271_FAILVALUE;
        }
        // If owner is an EOA
        else {
            return
                _owner == ECDSA.recover(dataHash, signature)
                    ? _ERC1271_MAGICVALUE
                    : _ERC1271_FAILVALUE;
        }
    }

    // Internal functions

    // Fallback

    /**
     * @dev Forwards the call to an extension mapped to a function selector. If no extension address
     * is mapped to the function selector (address(0)), then revert.
     *
     * The bytes4(0) msg.sig is an exception, the function won't revert if there is no extension found
     * mapped to bytes4(0), but will execute the call to the extension in case it existed.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * Because the function uses assembly {return()/revert()} to terminate the call, it cannot be
     * called before other codes in fallback().
     *
     * Otherwise, the codes after _fallbackLSP17Extendable() may never be reached.
     */
    function _fallbackLSP17Extendable() internal virtual override {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found for bytes4(0) return don't revert
        if (msg.sig == bytes4(0) && extension == address(0)) return;

        // if no extension was found, revert
        if (extension == address(0)) revert NoExtensionFoundForFunctionSelector(msg.sig);

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
            let success := call(gas(), extension, 0, 0, add(calldatasize(), 52), 0, 0)

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
     * @dev Returns the extension stored under the `_LSP17_EXTENSION_PREFIX` data key
     * mapped to the functionSelector provided.
     *
     * If no extension is stored, returns the address(0)
     */
    function _getExtension(
        bytes4 functionSelector
    ) internal view virtual override returns (address) {
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension for the function selector provided
        address extension = address(bytes20(_getData(mappedExtensionDataKey)));

        return extension;
    }

    // ERC725Y

    /**
     * @dev SAVE GAS by emitting the DataChanged event with only the first 256 bytes of dataValue
     */
    function _setData(bytes32 dataKey, bytes memory dataValue) internal virtual override {
        _store[dataKey] = dataValue;
        emit DataChanged(
            dataKey,
            dataValue.length <= 256 ? dataValue : BytesLib.slice(dataValue, 0, 256)
        );
    }
}
