// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {GasLib} from "../Utils/GasLib.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// modules
import {ERC725XCore, IERC725X} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {ERC725YCore, IERC725Y} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {LSP17Extendable} from "../LSP17ContractExtension/LSP17Extendable.sol";

// constants
import "@erc725/smart-contracts/contracts/errors.sol";
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_LSP1,
    _LSP1_UNIVERSALRECEIVER_SELECTOR,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9} from "./LSP9Constants.sol";
import {_INTERFACEID_LSP14} from "../LSP14Ownable2Step/LSP14Constants.sol";
import {_LSP17_EXTENSION_PREFIX} from "../LSP17ContractExtension/LSP17Constants.sol";

/**
 * @title Core Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultCore is
    ERC725XCore,
    ERC725YCore,
    LSP14Ownable2Step,
    LSP17Extendable,
    ILSP1UniversalReceiver
{
    using ERC165Checker for address;

    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of native tokens received
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Modifier restricting the call to the owner of the contract and the UniversalReceiverDelegate
     */
    modifier onlyAllowed() {
        if (msg.sender != owner()) {
            address universalReceiverAddress = address(
                bytes20(_getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY))
            );
            require(
                ERC165Checker.supportsERC165Interface(msg.sender, _INTERFACEID_LSP1) &&
                    msg.sender == universalReceiverAddress,
                "Only Owner or Universal Receiver Delegate allowed"
            );
        }
        _;
    }

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executed when receiving native tokens with empty calldata.
     */
    receive() external payable virtual {
        if (msg.value > 0) emit ValueReceived(msg.sender, msg.value);
    }

    // solhint-disable

    /**
     * @dev Returns the extension stored under the `_LSP17_EXTENSION_PREFIX` data key
     * mapped to the functionSelector provided.
     *
     * If no extension is stored, returns the address(0)
     */
    function _getExtension(bytes4 functionSelector) internal view override returns (address) {
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension for the function selector provided
        address extension = address(bytes20(_getData(mappedExtensionDataKey)));

        return extension;
    }

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Forwards the call to an extension (address) stored under a _LSP17_FALLBACK_EXTENSIONS_HANDLER_ appended
     * to a function selector. If there is no extension stored under the data key, return.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * If the msg.data is shorter than 4 bytes, do not check for an extension and return
     *
     * Executed when:
     * - the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     * - receiving native tokens with some calldata.
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        _fallbackLSP17Extendable();
    }

    // solhint-enable

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
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
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC725X
     * @param operationType The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3
     * @dev Executes any other smart contract.
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * Emits a {Executed} event, when a call is executed under `operationType` 0 and 3
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2
     * Emits a {ValueReceived} event, when receives native token
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);

        return _execute(operationType, target, value, data);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets data as bytes in the vault storage for a single key.
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) public virtual override onlyAllowed {
        _setData(dataKey, dataValue);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets array of data at multiple given `key`
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory dataKeys, bytes[] memory dataValues)
        public
        virtual
        override
        onlyAllowed
    {
        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch(dataKeys.length, dataValues.length);
        }

        for (uint256 i = 0; i < dataKeys.length; i = GasLib.uncheckedIncrement(i)) {
            _setData(dataKeys[i], dataValues[i]);
        }
    }

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * Forwards the call to the addresses stored in the ERC725Y storage under the LSP1UniversalReceiverDelegate
     * Key and the typeId Key (param) respectively. The call will be discarded if no addresses are set.
     *
     * @param typeId The type of call received.
     * @param receivedData The data received.
     * @return returnedValues The ABI encoded return value of the LSP1UniversalReceiverDelegate call
     * and the LSP1TypeIdDelegate call.
     */
    function universalReceiver(bytes32 typeId, bytes calldata receivedData)
        public
        payable
        virtual
        returns (bytes memory returnedValues)
    {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (universalReceiverDelegate.supportsERC165Interface(_INTERFACEID_LSP1)) {
                bytes memory callData = abi.encodePacked(
                    abi.encodeWithSelector(_LSP1_UNIVERSALRECEIVER_SELECTOR, typeId, receivedData),
                    msg.sender,
                    msg.value
                );
                // solhint-disable avoid-low-level-calls
                (bool success, bytes memory result) = universalReceiverDelegate.call(callData);
                _verifyCallResult(success, result);
                resultDefaultDelegate = result.length != 0 ? abi.decode(result, (bytes)) : result;
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

            if (universalReceiverDelegate.supportsERC165Interface(_INTERFACEID_LSP1)) {
                bytes memory callData = abi.encodePacked(
                    abi.encodeWithSelector(_LSP1_UNIVERSALRECEIVER_SELECTOR, typeId, receivedData),
                    msg.sender,
                    msg.value
                );
                // solhint-disable avoid-low-level-calls
                (bool success, bytes memory result) = universalReceiverDelegate.call(callData);
                _verifyCallResult(success, result);
                resultTypeIdDelegate = result.length != 0 ? abi.decode(result, (bytes)) : result;
            }
        }

        returnedValues = abi.encode(resultDefaultDelegate, resultTypeIdDelegate);
        emit UniversalReceiver(msg.sender, msg.value, typeId, receivedData, returnedValues);
    }

    /**
     * @dev Sets the pending owner and notify the pending owner
     *
     * @param _newOwner The address nofied and set as `pendingOwner`
     */
    function transferOwnership(address _newOwner)
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
        onlyOwner
    {
        LSP14Ownable2Step._transferOwnership(_newOwner);
    }

    /**
     * @dev Renounce ownership of the contract in a 2-step process
     */
    function renounceOwnership()
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
        onlyOwner
    {
        LSP14Ownable2Step._renounceOwnership();
    }

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

    /**
     * @dev disable operation type DELEGATECALL (4).
     * NB: providing operation type DELEGATECALL (4) as argument will result
     * in custom error ERC725X_UnknownOperationType(4)
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
            if (target != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate(value, data);
        }

        // Deploy with CREATE2
        if (operationType == uint256(OPERATION_2_CREATE2)) {
            if (target != address(0)) revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate2(value, data);
        }

        // STATICCALL
        if (operationType == uint256(OPERATION_3_STATICCALL)) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInStaticCall();
            return _executeStaticCall(target, data);
        }

        revert ERC725X_UnknownOperationType(operationType);
    }

    function _verifyCallResult(bool success, bytes memory returndata)
        internal
        pure
        returns (bytes memory)
    {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly
                // solhint-disable no-inline-assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                // solhint-disable reason-string
                revert();
            }
        }
    }
}
