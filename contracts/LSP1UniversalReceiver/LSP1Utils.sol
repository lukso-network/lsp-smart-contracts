// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import {_LSP5_RECEIVED_ASSETS_ARRAY_KEY, _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX} from "../LSP5ReceivedAssets/LSP5Constants.sol";
import {_INTERFACEID_LSP7, _TYPEID_LSP7_TOKENSSENDER, _TYPEID_LSP7_TOKENSRECIPIENT} from "../LSP7DigitalAsset/LSP7Constants.sol";
import {_INTERFACEID_LSP8, _TYPEID_LSP8_TOKENSRECIPIENT, _TYPEID_LSP8_TOKENSSENDER} from "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import {_INTERFACEID_LSP9, _TYPEID_LSP9_VAULTRECIPIENT} from "../LSP9Vault/LSP9Constants.sol";
import {_LSP10_VAULTS_ARRAY_KEY, _LSP10_VAULTS_MAP_KEY_PREFIX} from "../LSP10ReceivedVaults/LSP10Constants.sol";

library LSP1Utils {
    /**
     * @dev Gets all the transfer details depending on the `typeId`
     */
    function getTransferDetails(bytes32 typeId)
        internal
        pure
        returns (
            bool isReceiving,
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
            isReceiving = typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
                typeId == _TYPEID_LSP8_TOKENSRECIPIENT
                ? true
                : false;
        } else {
            arrayKey = _LSP10_VAULTS_ARRAY_KEY;
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            isReceiving = typeId == _TYPEID_LSP9_VAULTRECIPIENT ? true : false;
        }
    }
}
