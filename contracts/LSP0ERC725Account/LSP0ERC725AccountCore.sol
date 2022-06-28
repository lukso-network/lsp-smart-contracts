// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP1UniversalReceiverDelegate} from "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// libraries
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ClaimOwnership} from "../Custom/ClaimOwnership.sol";

// constants
import {_INTERFACEID_LSP0, _INTERFACEID_ERC1271, _ERC1271_FAILVALUE} from "../LSP0ERC725Account/LSP0Constants.sol";
import {_INTERFACEID_LSP1, _INTERFACEID_LSP1_DELEGATE, _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_CLAIM_OWNERSHIP} from "../Custom/IClaimOwnership.sol";

/**
 * @title Core Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountCore is
    ERC725XCore,
    ERC725YCore,
    ClaimOwnership,
    IERC1271,
    ILSP1UniversalReceiver
{
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
        if (msg.value > 0) emit ValueReceived(msg.sender, msg.value);
    }

    //    TODO to be discussed
    //    function fallback()
    //    public
    //    {
    //        address to = owner();
    //        assembly {
    //            calldatacopy(0, 0, calldatasize())
    //            let result := staticcall(gas(), to, 0, calldatasize(), 0, 0)
    //            returndatacopy(0, 0, returndatasize())
    //            switch result
    //            case 0  { revert (0, returndatasize()) }
    //            default { return (0, returndatasize()) }
    //        }
    //    }

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
            interfaceId == _INTERFACEID_CLAIM_OWNERSHIP ||
            super.supportsInterface(interfaceId);
    }

    // ERC173 - Modified ClaimOwnership

    /**
     * @dev Sets the pending owner
     */
    function transferOwnership(address _newOwner)
        public
        virtual
        override(ClaimOwnership, OwnableUnset)
        onlyOwner
    {
        ClaimOwnership._transferOwnership(_newOwner);
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
        override
        returns (bytes4 magicValue)
    {
        // prettier-ignore
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
     * @param data The data received.
     */
    function universalReceiver(bytes32 typeId, bytes calldata data)
        public
        payable
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (
                ERC165Checker.supportsERC165Interface(
                    universalReceiverDelegate,
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                returnValue = ILSP1UniversalReceiverDelegate(universalReceiverDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, data);
            }
        }
        emit UniversalReceiver(msg.sender, msg.value, typeId, returnValue, data);
    }
}
