// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import "@erc725/smart-contracts/contracts/utils/ERC725Utils.sol";

// constants
import "../../LSP1Constants.sol";
import "../../../LSP7DigitalAsset/LSP7Constants.sol";
import "../../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets
 */
abstract contract TokenHandlingContract {
    using ERC725Utils for IERC725Y;

    // prettier-ignore
    function _tokenHandling(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) internal returns (bytes memory) {

        (bytes32 arrayKey, bytes32 mapHash, bytes4 interfaceId) = _getTransferData(typeId);
        bytes32 mapKey = ERC725Utils.generateMapKey(mapHash, abi.encodePacked(sender));
        IERC725Y vault = IERC725Y(msg.sender);
        bytes memory mapValue = vault.getDataSingle(mapKey);
        
        if (typeId == _LSP7TOKENSRECIPIENT_TYPE_ID || typeId == _LSP8TOKENSRECIPIENT_TYPE_ID) {

            if (mapValue.length != 12) {

                (bytes32[] memory keys,
                bytes[] memory values) = ERC725Utils.addMapAndArrayKey(vault, arrayKey, mapKey, sender, interfaceId);

                vault.setData(keys, values);
            }
            
        } else if (typeId == _LSP7TOKENSSENDER_TYPE_ID || typeId == _LSP8TOKENSSENDER_TYPE_ID) {

            if (mapValue.length == 12){

                uint256 balance = ILSP7DigitalAsset(sender).balanceOf(msg.sender);
                if ((balance - _tokenAmount(typeId,data)) == 0) {

                    (bytes32[] memory keys,
                    bytes[] memory values) = ERC725Utils.removeMapAndArrayKey(vault, arrayKey, mapHash, mapKey, interfaceId);

                    vault.setData(keys, values);
                }
            }
        }
    }

    // helper functions

    function _getTransferData(bytes32 _typeId)
        private
        pure
        returns (
            bytes32 arrayKey,
            bytes32 mapHash,
            bytes4 interfaceID
        )
    {
        arrayKey = _LSP5_ARRAY_KEY;
        mapHash = _LSP5_ASSET_MAP_HASH;
        if (
            _typeId == _LSP7TOKENSSENDER_TYPE_ID ||
            _typeId == _LSP7TOKENSRECIPIENT_TYPE_ID
        ) {
            interfaceID = _LSP7_INTERFACE_ID;
        } else {
            interfaceID = _LSP8_INTERFACE_ID;
        }
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
