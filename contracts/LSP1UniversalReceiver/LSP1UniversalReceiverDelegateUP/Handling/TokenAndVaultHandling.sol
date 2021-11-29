// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "../../../LSP6KeyManager/ILSP6KeyManager.sol";
import "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import "@erc725/smart-contracts/contracts/utils/ERC725Utils.sol";

// constants
import "../../LSP1Constants.sol";
import "../../../LSP7DigitalAsset/LSP7Constants.sol";
import "../../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets and vaults
 */
abstract contract TokenAndVaultHandlingContract {
    using ERC725Utils for IERC725Y;

    // prettier-ignore

    function _tokenAndVaultHandling(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) internal returns (bytes memory result) {

        (bytes32 arrayKey, bytes32 mapHash, bytes4 interfaceID) = _getTransferData(typeId);
        address keyManagerAddress = ERC725Y(msg.sender).owner();
        bytes32 mapKey = ERC725Utils.generateMapKey(mapHash,abi.encodePacked(sender));
        bytes memory mapValue = IERC725Y(msg.sender).getDataSingle(mapKey);

        if (
            typeId == _LSP7TOKENSRECIPIENT_TYPE_ID || typeId == _LSP8TOKENSRECIPIENT_TYPE_ID ||
            typeId == _LSP9_VAULT_RECEPIENT_TYPE_ID_) {

            if (mapValue.length != 12) {

                (bytes32[] memory keys,
                bytes[] memory values) = ERC725Utils.addMapAndArrayKey(IERC725Y(msg.sender), arrayKey, mapKey, sender, interfaceID);

                result = _executeViaKeyManager(keyManagerAddress, keys, values);
            }

        } else if (
            typeId == _LSP7TOKENSSENDER_TYPE_ID || typeId == _LSP8TOKENSSENDER_TYPE_ID ||
            typeId == _LSP9_VAULT_SENDER_TYPE_ID_) {
                
            if (mapValue.length == 12) {

                if (typeId == _LSP9_VAULT_SENDER_TYPE_ID_) {

                    (bytes32[] memory keys,
                    bytes[] memory values) = ERC725Utils.removeMapAndArrayKey(IERC725Y(msg.sender), arrayKey, mapHash, mapKey, interfaceID);

                    result = _executeViaKeyManager(keyManagerAddress,keys,values);

                } else if (
                    typeId == _LSP7TOKENSSENDER_TYPE_ID || typeId == _LSP8TOKENSSENDER_TYPE_ID) {

                    uint256 balance = ILSP7DigitalAsset(sender).balanceOf(msg.sender);
                    if ((balance - _tokenAmount(typeId, data)) == 0) {
                       
                        (bytes32[] memory keys,
                        bytes[] memory values) = ERC725Utils.removeMapAndArrayKey(IERC725Y(msg.sender), arrayKey, mapHash, mapKey, interfaceID);

                        result = _executeViaKeyManager(keyManagerAddress,keys,values);
                    }
                }
            }
        }
    }

    // helper functions

    function _getTransferData(bytes32 _typeId)
        private
        pure
        returns (
            bytes32 _arrayKey,
            bytes32 _mapHash,
            bytes4 _interfaceID
        )
    {
        if (
            _typeId == _LSP7TOKENSSENDER_TYPE_ID ||
            _typeId == _LSP7TOKENSRECIPIENT_TYPE_ID ||
            _typeId == _LSP8TOKENSSENDER_TYPE_ID ||
            _typeId == _LSP8TOKENSRECIPIENT_TYPE_ID
        ) {
            _arrayKey = _LSP5_ARRAY_KEY;
            _mapHash = _LSP5_ASSET_MAP_HASH;
            if (
                _typeId == _LSP7TOKENSSENDER_TYPE_ID ||
                _typeId == _LSP7TOKENSRECIPIENT_TYPE_ID
            ) {
                _interfaceID = _LSP7_INTERFACE_ID;
            } else {
                _interfaceID = _LSP8_INTERFACE_ID;
            }
        } else if (
            _typeId == _LSP9_VAULT_SENDER_TYPE_ID_ ||
            _typeId == _LSP9_VAULT_RECEPIENT_TYPE_ID_
        ) {
            _arrayKey = _LSP10_ARRAY_KEY;
            _mapHash = _LSP10_VAULT_MAP_HASH;
            _interfaceID = _LSP9_INTERFACE_ID;
        }
    }

    function _executeViaKeyManager(
        address _keyManagerAdd,
        bytes32[] memory _keys,
        bytes[] memory _values
    ) private returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            _keys,
            _values
        );
        result = ILSP6KeyManager(_keyManagerAdd).execute(payload);
    }

    function _tokenAmount(bytes32 _typeId, bytes memory _data)
        private
        pure
        returns (uint256 amount)
    {
        if (_typeId == _LSP7TOKENSSENDER_TYPE_ID) {
            /* solhint-disable */
            assembly {
                amount := mload(add(add(_data, 0x20), 0x28))
            }
            /* solhint-enable */
        } else {
            amount = 1;
        }
    }
}
