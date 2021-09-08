// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "./_LSPs/ILSP1_UniversalReceiver.sol";
import "./_LSPs/ILSP1_UniversalReceiverDelegate.sol";

// modules
import "../submodules/ERC725/implementations/contracts/ERC725/ERC725Account.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

/**
 * @title LSP3Account implementation for LUKSO
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract LSP3Account is ERC165Storage, ERC725Account, ILSP1 {

    bytes4 constant _INTERFACE_ID_LSP1 = 0x6bb56a14;
    bytes4 constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 constant private _UNIVERSAL_RECEIVER_DELEGATE_KEY =
        0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47; // keccak256("LSP1UniversalReceiverDelegate")

    bytes32[] public dataKeys;

    constructor(address _newOwner) ERC725Account(_newOwner) {

        // Add the key of the SupportedStandards:ERC725Account set in the constructor of ERC725Account.sol
        dataKeys.push(0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6);

        _registerInterface(_INTERFACE_ID_LSP1);
    }

    /* non-standard public functions */

    function dataCount() public view returns (uint256) {
        return dataKeys.length;
    }

    function allDataKeys() public view returns (bytes32[] memory) {
        return dataKeys;
    }

    function setDataMultiple(bytes32[] calldata _keys, bytes[] calldata _values)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < _keys.length; i++) {
            setData(_keys[i], _values[i]);
        }
    }

    function getDataMultiple(bytes32[] calldata _keys)
        public
        view
        returns(bytes[] memory)
    {
        uint256 length = _keys.length;
        bytes[] memory values = new bytes[](length);

        for (uint256 i=0; i < length; i++) {
            values[i] = getData(_keys[i]);
        }

        return values;
    }

    /* Public functions */

    function setData(bytes32 _key, bytes calldata _value)
        public
        override
        onlyOwner
    {
        if(store[_key].length == 0) {
            dataKeys.push(_key);
        }
        store[_key] = _value;
        emit DataChanged(_key, _value);
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
        bytes memory receiverData = getData(_UNIVERSAL_RECEIVER_DELEGATE_KEY);
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