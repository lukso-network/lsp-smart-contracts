// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// modules

import "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import "@erc725/smart-contracts/contracts/ERC725XCore.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../Utils/ERC725Utils.sol";

// constants
import "../LSP0ERC725Account/LSP0Constants.sol";
import "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title Core Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountCore is
    IERC1271,
    ILSP1UniversalReceiver,
    ERC725XCore,
    ERC725YCore
{
    using ERC725Utils for IERC725Y;

    event ValueReceived(address indexed sender, uint256 indexed value);

    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
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

    /**
     * @notice Checks if an owner signed `_data`.
     * ERC1271 interface.
     *
     * @param _hash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
     * @param _signature owner's signature(s) of the data
     */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
        public
        view
        override
        returns (bytes4 magicValue)
    {
        // prettier-ignore
        // if OWNER is a contract
        if (owner().code.length != 0) {
            return 
                supportsInterface(_INTERFACEID_ERC1271)
                    ? IERC1271(owner()).isValidSignature(_hash, _signature)
                    : _ERC1271_FAILVALUE;
        // if OWNER is a key
        } else {
            return 
                owner() == ECDSA.recover(_hash, _signature)
                    ? _INTERFACEID_ERC1271
                    : _ERC1271_FAILVALUE;
        }
    }

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * @dev Forwards the call to the UniversalReceiverDelegate if set.
     * @param _typeId The type of call received.
     * @param _data The data received.
     */
    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory data = IERC725Y(this).getDataSingle(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );

        if (data.length >= 20) {
            address universalReceiverAddress = BytesLib.toAddress(data, 0);
            if (
                ERC165Checker.supportsInterface(
                    universalReceiverAddress,
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                returnValue = ILSP1UniversalReceiverDelegate(
                    universalReceiverAddress
                ).universalReceiverDelegate(_msgSender(), _typeId, _data);
            }
        }
        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);
    }
}
