// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants

import "../LSP5ReceivedAssets/LSP5Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../LSP9Vault/LSP9Constants.sol";
import "../LSP5ReceivedAssets/LSP5Constants.sol";
import "../LSP10ReceivedVaults/LSP10Constants.sol";

library LSP1Utils {
    /**
     * @dev Gets all the transfer details depending on the `typeId`
     */
    function getTransferDetails(bytes32 typeId)
        internal
        pure
        returns (
            bool senderHook,
            bytes32 arrayKey,
            bytes12 mapPrefix,
            bytes4 interfaceId
        )
    {
        if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSSENDER
        ) {
            arrayKey = _LSP5_RECEIVED_ASSETS_ARRAY_KEY;
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = typeId == _TYPEID_LSP7_TOKENSSENDER ||
                typeId == _TYPEID_LSP7_TOKENSRECIPIENT
                ? _INTERFACEID_LSP7
                : _INTERFACEID_LSP8;
            senderHook = typeId == _TYPEID_LSP7_TOKENSSENDER ||
                typeId == _TYPEID_LSP8_TOKENSSENDER
                ? true
                : false;
        } else {
            arrayKey = _LSP10_VAULTS_ARRAY_KEY;
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            senderHook = typeId == _TYPEID_LSP9_VAULTSENDER ? true : false;
        }
    }
}
