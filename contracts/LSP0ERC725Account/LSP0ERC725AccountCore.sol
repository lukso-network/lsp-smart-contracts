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
     * @param value The amount of value sent
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Emits an event when receiving native tokens
     */
    fallback() external payable virtual {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
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
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            super.supportsInterface(interfaceId);
    }

    // ERC173 - Modified ClaimOwnership

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

    // ERC1271

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

    // LSP1

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * @dev Forwards the call to the UniversalReceiverDelegate if set.
     * @param typeId The type of call received.
     * @param receivedData The data received.
     * @return returnedValue The ABI encoded return value of the LSP1UniversalReceiverDelegate call
     * and the LSP1TypeIdDelegate call
     */
    function universalReceiver(bytes32 typeId, bytes calldata receivedData)
        public
        payable
        virtual
        returns (bytes memory returnedValue)
    {
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        bytes memory returnedValue1;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (universalReceiverDelegate.supportsERC165Interface(_INTERFACEID_LSP1_DELEGATE)) {
                returnedValue1 = ILSP1UniversalReceiverDelegate(universalReceiverDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, receivedData);
            }
        }

        bytes memory lsp1TypeIdDelegateValue = _getData(typeId);
        bytes memory returnedValue2;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1TypeIdDelegateValue));

            if (universalReceiverDelegate.supportsERC165Interface(_INTERFACEID_LSP1_DELEGATE)) {
                returnedValue2 = ILSP1UniversalReceiverDelegate(universalReceiverDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, receivedData);
            }
        }

        returnedValue = abi.encode(returnedValue1, returnedValue2);
        emit UniversalReceiver(msg.sender, msg.value, typeId, receivedData, returnedValue);
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
