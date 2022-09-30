// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {
    ILSP1UniversalReceiverDelegate
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {GasLib} from "../Utils/GasLib.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// modules
import {ERC725XCore, IERC725X} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {ERC725YCore, IERC725Y} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import {_INTERFACEID_LSP14} from "../LSP14Ownable2Step/LSP14Constants.sol";

import {
    OPERATION_CALL,
    OPERATION_STATICCALL,
    OPERATION_CREATE,
    OPERATION_CREATE2
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9} from "./LSP9Constants.sol";

/**
 * @title Core Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultCore is ERC725XCore, ERC725YCore, LSP14Ownable2Step, ILSP1UniversalReceiver {
    using ERC165Checker for address;
    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of value sent
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    // modifiers

    /**
     * @dev Modifier restricting the call to the owner of the contract and the UniversalReceiverDelegate
     */
    modifier onlyAllowed() {
        if (msg.sender != owner()) {
            address universalReceiverAddress = address(
                bytes20(_getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY))
            );
            require(
                ERC165Checker.supportsERC165Interface(msg.sender, _INTERFACEID_LSP1_DELEGATE) &&
                    msg.sender == universalReceiverAddress,
                "Only Owner or Universal Receiver Delegate allowed"
            );
        }
        _;
    }

    // public functions

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executes on calls made with data included
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
    }

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executes on calls mae without data included
     * E.g. calls made via `send()` or `transfer()`
     */
    receive() external payable virtual {
        emit ValueReceived(msg.sender, msg.value);
    }

    // ERC725

    /**
     * @inheritdoc IERC725X
     * @param operation The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3
     * @dev Executes any other smart contract.
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * Emits a {Executed} event, when a call is executed under `operationType` 0 and 3
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2
     */
    function execute(
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        require(address(this).balance >= value, "ERC725X: insufficient balance");

        // CALL
        if (operation == OPERATION_CALL) return _executeCall(to, value, data);

        // Deploy with CREATE
        if (operation == OPERATION_CREATE) return _deployCreate(to, value, data);

        // Deploy with CREATE2
        if (operation == OPERATION_CREATE2) return _deployCreate2(to, value, data);

        // STATICCALL
        if (operation == OPERATION_STATICCALL) return _executeStaticCall(to, value, data);

        revert("ERC725X: Unknown operation type");
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
        require(dataKeys.length == dataValues.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < dataKeys.length; i = GasLib.uncheckedIncrement(i)) {
            _setData(dataKeys[i], dataValues[i]);
        }
    }

    // LSP1

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
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (universalReceiverDelegate.supportsERC165Interface(_INTERFACEID_LSP1_DELEGATE)) {
                resultDefaultDelegate = ILSP1UniversalReceiverDelegate(universalReceiverDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, receivedData);
            }
        }

        bytes memory lsp1TypeIdDelegateValue = _getData(typeId);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address typeIdDelegate = address(bytes20(lsp1TypeIdDelegateValue));

            if (typeIdDelegate.supportsERC165Interface(_INTERFACEID_LSP1_DELEGATE)) {
                resultTypeIdDelegate = ILSP1UniversalReceiverDelegate(typeIdDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, receivedData);
            }
        }

        returnedValues = abi.encode(resultDefaultDelegate, resultTypeIdDelegate);
        emit UniversalReceiver(msg.sender, msg.value, typeId, receivedData, returnedValues);
    }

    // ERC173 - Modified ClaimOwnership

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

    // ERC165

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP9 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            super.supportsInterface(interfaceId);
    }

    // internal functions

    /**
     * @dev SAVE GAS by emitting the DataChanged event with only the first 256 bytes of dataValue
     */
    function _setData(bytes32 dataKey, bytes memory dataValue) internal virtual override {
        store[dataKey] = dataValue;
        emit DataChanged(
            dataKey,
            dataValue.length <= 256 ? dataValue : BytesLib.slice(dataValue, 0, 256)
        );
    }
}
