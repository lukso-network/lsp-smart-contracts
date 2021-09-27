// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./_LSPs/ILSP1_UniversalReceiver.sol";
import "./_LSPs/ILSP1_UniversalReceiverDelegate.sol";
import "../submodules/ERC725/implementations/contracts/ERC725/ERC725YInit.sol";

// modules
import "../submodules/ERC725/implementations/contracts/ERC725/ERC725AccountInit.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

// libraries
import "./Utils/ERC725Utils.sol";

/**
 * @title ERC725Account implementation for LUKSO
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract LSP3AccountInit is ERC165Storage, ERC725AccountInit, ILSP1 {
    using ERC725Utils for ERC725YInit;

    bytes4 constant _INTERFACE_ID_LSP1 = 0x6bb56a14;
    bytes4 constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 constant private _UNIVERSAL_RECEIVER_DELEGATE_KEY =
        0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")

    bytes32[] public dataKeys;

    function initialize(address _newOwner) virtual override public {
        ERC725AccountInit.initialize(_newOwner);
        // Add the key of the SupportedStandards:ERC725Account set in the constructor of ERC725Account.sol
        dataKeys.push(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6);

        _registerInterface(_INTERFACE_ID_LSP1);
    }

    /* non-standard public functions */

    function allDataKeys() public view returns (bytes32[] memory) {
        return dataKeys;
    }

    function setData(bytes32[] calldata _keys, bytes[] calldata _values)
        public
        override
        onlyOwner
    {
        for (uint256 ii = 0; ii < _keys.length; ii++) {
            if (store[_keys[ii]].length == 0) {
                dataKeys.push(_keys[ii]);
            }
            _setData(_keys[ii], _values[ii]);
        }
    }

    /**
    * @notice Notify the smart contract about any received asset
    * LSP1 interface
    *
    * @param _typeId The type of transfer received
    * @param _data The data received
    */
    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        override
        virtual
        returns (bytes32 returnValue)
    {
        bytes memory receiverData = ERC725YInit(this).getDataSingle(_UNIVERSAL_RECEIVER_DELEGATE_KEY);
        returnValue = "";

        // call external contract
        if (receiverData.length == 20) {
            address universalReceiverAddress = BytesLib.toAddress(receiverData, 0);

            if(ERC165(universalReceiverAddress).supportsInterface(_INTERFACE_ID_LSP1DELEGATE)) {
                returnValue = ILSP1Delegate(universalReceiverAddress).universalReceiverDelegate(
                    _msgSender(), 
                    _typeId, 
                    _data
                );
            }
        }

        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);

        return returnValue;
    }
}