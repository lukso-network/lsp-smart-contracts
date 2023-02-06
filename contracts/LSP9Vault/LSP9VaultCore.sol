// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {GasLib} from "../Utils/GasLib.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP1Utils} from "../LSP1UniversalReceiver/LSP1Utils.sol";
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
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";

import {_LSP6KEY_ADDRESSPERMISSIONS_PREFIX} from "../LSP6KeyManager/LSP6Constants.sol";
import {
    _INTERFACEID_LSP9,
    _TYPEID_LSP9_OwnershipTransferStarted,
    _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "./LSP9Constants.sol";
import {_INTERFACEID_LSP14} from "../LSP14Ownable2Step/LSP14Constants.sol";
import {_LSP17_EXTENSION_PREFIX} from "../LSP17ContractExtension/LSP17Constants.sol";

// errors
import "./LSP9Errors.sol";

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
    using LSP1Utils for *;

    address private _reentrantDelegate;

    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of native tokens received
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executed when receiving native tokens with empty calldata.
     */
    receive() external payable virtual {
        if (msg.value > 0) emit ValueReceived(msg.sender, msg.value);
    }

    /**
     * @dev Returns the extension stored under the `_LSP17_EXTENSION_PREFIX` data key
     * mapped to the functionSelector provided.
     *
     * If no extension is stored, returns the address(0)
     */
    function _getExtension(bytes4 functionSelector)
        internal
        view
        virtual
        override
        returns (address)
    {
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension for the function selector provided
        address extension = address(bytes20(_getData(mappedExtensionDataKey)));

        return extension;
    }

    // solhint-disable no-complex-fallback

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Forwards the call to an extension (address) stored under a _LSP17_FALLBACK_EXTENSIONS_HANDLER_ appended
     * to a function selector. If there is no extension stored under the data key, return.
     *
     * The call to the extension is appended with bytes20 (msg.sender) and bytes32 (msg.value).
     * Returns the return value on success and revert in case of failure.
     *
     * If the msg.data is shorter than 4 bytes or the first 4 bytes are 0s
     * do not check for an extension and return
     *
     * Executed when:
     * - the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     * - receiving native tokens with some calldata.
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        if (msg.data.length < 4 || msg.sig == bytes4(0)) return;
        _fallbackLSP17Extendable();
    }

    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`.
     *
     * If the contract doesn't support the `interfaceId`, it forwards the call to the
     * `supportsInterface` extension according to LSP17, and checks if the extension
     * implements the interface defined by `interfaceId`.
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
            super.supportsInterface(interfaceId) ||
            _supportsInterfaceInERC165Extension(interfaceId);
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
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        return _execute(operationType, target, value, data);
    }

    /**
     * @inheritdoc ERC725XCore
     *
     * @dev Emits a {ValueReceived} event when receiving native tokens.
     */
    function execute(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override onlyOwner returns (bytes[] memory) {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        return _execute(operationsType, targets, values, datas);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets data as bytes in the vault storage for a single key.
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) public virtual override {
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
     * @inheritdoc IERC725Y
     * @dev Sets array of data at multiple given `key`
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory dataKeys, bytes[] memory dataValues) public virtual override {
        bool isURD = _validateAndIdentifyCaller();
        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch(dataKeys.length, dataValues.length);
        }

        for (uint256 i = 0; i < dataKeys.length; i = GasLib.uncheckedIncrement(i)) {
            if (isURD) {
                if (
                    bytes12(dataKeys[i]) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX ||
                    bytes6(dataKeys[i]) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX ||
                    bytes12(dataKeys[i]) == _LSP17_EXTENSION_PREFIX
                ) {
                    revert LSP1DelegateNotAllowedToSetDataKey(dataKeys[i]);
                }
            }
            _setData(dataKeys[i], dataValues[i]);
        }
    }

    /**
     * @dev Modifier restricting the call to the owner of the contract and the UniversalReceiverDelegate
     */
    function _validateAndIdentifyCaller() internal view returns (bool isURD) {
        if (msg.sender != owner()) {
            require(
                msg.sender == _reentrantDelegate,
                "Only Owner or reentered Universal Receiver Delegate allowed"
            );
            isURD = true;
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
        bytes memory lsp1DelegateValue = _store.getLSP1DelegateValue();
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (universalReceiverDelegate.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
                _reentrantDelegate = universalReceiverDelegate;
                resultDefaultDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        bytes memory lsp1TypeIdDelegateValue = _store.getLSP1DelegateValueForTypeId(typeId);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1TypeIdDelegateValue));

            if (universalReceiverDelegate.supportsERC165InterfaceUnchecked(_INTERFACEID_LSP1)) {
                _reentrantDelegate = universalReceiverDelegate;
                resultTypeIdDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        delete _reentrantDelegate;
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

    // --- LSP14 URD Hooks

    /**
     * @dev Calls the universalReceiver function of the sender when ownerhsip transfer starts
     * if supports LSP1 InterfaceId
     */
    function _notifyLSP1SenderOnOwnershipTransferStart(address notifiedContract, bytes memory data)
        internal
        virtual
        override
    {
        if (ERC165Checker.supportsERC165InterfaceUnchecked(notifiedContract, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(notifiedContract).universalReceiver(
                _TYPEID_LSP9_OwnershipTransferStarted,
                data
            );
        }
    }

    /**
     * @dev Calls the universalReceiver function of the sender when ownerhsip transfer is complete
     * if supports LSP1 InterfaceId
     */
    function _notifyLSP1SenderOnOwnershipTransferCompletion(
        address notifiedContract,
        bytes memory data
    ) internal virtual override {
        if (ERC165Checker.supportsERC165InterfaceUnchecked(notifiedContract, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(notifiedContract).universalReceiver(
                _TYPEID_LSP9_OwnershipTransferred_SenderNotification,
                data
            );
        }
    }

    /**
     * @dev Calls the universalReceiver function of the recipient when ownerhsip transfer is complete
     * if supports LSP1 InterfaceId
     */
    function _notifyLSP1RecipientOnOwnershipTransferCompletion(
        address notifiedContract,
        bytes memory data
    ) internal virtual override {
        if (ERC165Checker.supportsERC165InterfaceUnchecked(notifiedContract, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(notifiedContract).universalReceiver(
                _TYPEID_LSP9_OwnershipTransferred_RecipientNotification,
                data
            );
        }
    }
}
