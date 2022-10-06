// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {
    ILSP1UniversalReceiverDelegate
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";

// constants
import "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_LSP0,
    _INTERFACEID_ERC1271,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP14} from "../LSP14Ownable2Step/LSP14Constants.sol";

/**
 * @title Core Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountCore is
    ERC725XCore,
    ERC725YCore,
    LSP14Ownable2Step,
    IERC1271,
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
     * @dev Emits an event when receiving native tokens
     *
     * Executed when:
     * - the first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     * - receiving native tokens with some calldata.
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
    }

    /**
     * @dev Emits an event when receiving native tokens
     *
     * Executed when receiving native tokens with empty calldata.
     */
    receive() external payable virtual {
        emit ValueReceived(msg.sender, msg.value);
    }

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
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Checks if an owner signed `_data`.
     * ERC1271 interface.
     *
     * @param dataHash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
     * @param signature owner's signature(s) of the data
     */
    function isValidSignature(bytes32 dataHash, bytes memory signature)
        public
        view
        returns (bytes4 magicValue)
    {
        address _owner = owner();
        // if OWNER is a contract
        if (_owner.code.length != 0) {
            return
                ERC165Checker.supportsERC165Interface(_owner, _INTERFACEID_ERC1271)
                    ? IERC1271(_owner).isValidSignature(dataHash, signature)
                    : _ERC1271_FAILVALUE;
            // if OWNER is a key
        } else {
            return
                _owner == ECDSA.recover(dataHash, signature)
                    ? _INTERFACEID_ERC1271
                    : _ERC1271_FAILVALUE;
        }
    }

    /**
     * @param operation The operation to execute: CALL = 0 CREATE = 1 CREATE2 = 2 STATICCALL = 3 DELEGATECALL = 4
     * @param to The smart contract or address to interact with, `to` will be unused if a contract is created (operation 1 and 2)
     * @param value The amount of native tokens to transfer (in Wei).
     * @param data The call data, or the bytecode of the contract to deploy
     * @dev Executes any other smart contract.
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * Emits a {Executed} event, when a call is executed under `operationType` 0, 3 and 4
     * Emits a {ContractCreated} event, when a contract is created under `operationType` 1 and 2
     * Emits a {ValueReceived} event, when receives native token
     */
    function execute(
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        require(address(this).balance >= value, "ERC725X: insufficient balance");
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);

        // CALL
        if (operation == OPERATION_CALL) return _executeCall(to, value, data);

        // Deploy with CREATE
        if (operation == OPERATION_CREATE) return _deployCreate(to, value, data);

        // Deploy with CREATE2
        if (operation == OPERATION_CREATE2) return _deployCreate2(to, value, data);

        // STATICCALL
        if (operation == OPERATION_STATICCALL) return _executeStaticCall(to, value, data);

        // DELEGATECALL
        //
        // WARNING! delegatecall is a dangerous operation type! use with EXTRA CAUTION
        //
        // delegate allows to call another deployed contract and use its functions
        // to update the state of the current calling contract.
        //
        // this can lead to unexpected behaviour on the contract storage, such as:
        // - updating any state variables (even if these are protected)
        // - update the contract owner
        // - run selfdestruct in the context of this contract
        //
        if (operation == OPERATION_DELEGATECALL) return _executeDelegateCall(to, value, data);

        revert("ERC725X: Unknown operation type");
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

    /**
     * @dev Sets the pending owner and notifies the pending owner
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
        store[dataKey] = dataValue;
        emit DataChanged(
            dataKey,
            dataValue.length <= 256 ? dataValue : BytesLib.slice(dataValue, 0, 256)
        );
    }
}
