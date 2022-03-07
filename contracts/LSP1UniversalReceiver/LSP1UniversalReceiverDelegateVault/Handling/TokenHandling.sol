// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "../../../LSP7DigitalAsset/ILSP7DigitalAsset.sol";

// libraries
import "../../../Utils/ERC725Utils.sol";
import "../../../LSP5ReceivedAssets/LSP5Utils.sol";

// constants
import "../../LSP1Constants.sol";

import "../../../LSP5ReceivedAssets/LSP5Constants.sol";
import "../../../LSP7DigitalAsset/LSP7Constants.sol";
import "../../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../../../LSP9Vault/LSP9Constants.sol";

/**
 * @dev Function logic to add and remove the MapAndArrayKey of incoming assets
 */
abstract contract TokenHandlingContract {
    using ERC725Utils for IERC725Y;

    function _tokenHandling(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) internal returns (bytes memory) {
        (
            bytes32 arrayKey,
            bytes12 mapPrefix,
            bytes4 interfaceId
        ) = _getTransferData(typeId);
        bytes32 mapKey = LSP2Utils.generateBytes20MappingWithGroupingKey(
            mapPrefix,
            bytes20(sender)
        );
        IERC725Y vault = IERC725Y(msg.sender);
        bytes memory mapValue = vault.getDataSingle(mapKey);

        if (
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT
        ) {
            if (bytes12(mapValue) == bytes12(0)) {
                (bytes32[] memory keys, bytes[] memory values) = LSP5Utils
                    .addMapAndArrayKey(
                        vault,
                        arrayKey,
                        mapKey,
                        sender,
                        interfaceId
                    );

                vault.setData(keys, values);
            }
        } else if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP8_TOKENSSENDER
        ) {
            if (bytes12(mapValue) != bytes12(0)) {
                uint256 balance = ILSP7DigitalAsset(sender).balanceOf(
                    msg.sender
                );
                if ((balance - _tokenAmount(typeId, data)) == 0) {
                    (bytes32[] memory keys, bytes[] memory values) = LSP5Utils
                        .removeMapAndArrayKey(
                            vault,
                            arrayKey,
                            mapPrefix,
                            mapKey
                        );

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
            bytes12 mapPrefix,
            bytes4 interfaceID
        )
    {
        arrayKey = _LSP5_RECEIVED_ASSETS_ARRAY_KEY;
        mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
        if (
            _typeId == _TYPEID_LSP7_TOKENSSENDER ||
            _typeId == _TYPEID_LSP7_TOKENSRECIPIENT
        ) {
            interfaceID = _INTERFACEID_LSP7;
        } else {
            interfaceID = _INTERFACEID_LSP8;
        }
    }

    function _tokenAmount(bytes32 _typeId, bytes memory _data)
        private
        pure
        returns (uint256 amount)
    {
        if (_typeId == _TYPEID_LSP7_TOKENSSENDER) {
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
