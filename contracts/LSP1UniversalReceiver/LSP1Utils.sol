// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "../LSP5ReceivedAssets/LSP5Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../LSP9Vault/LSP9Constants.sol";
import "../LSP14Ownable2Step/LSP14Constants.sol";
import "../LSP10ReceivedVaults/LSP10Constants.sol";

library LSP1Utils {
    /**
     * @dev Gets all the transfer details depending on the `typeId`
     * @param typeId A unique identifier for a specific action
     */
    function getTransferDetails(bytes32 typeId)
        internal
        pure
        returns (
            bool invalid,
            bytes10 mapPrefix,
            bytes4 interfaceId,
            bool isReceiving
        )
    {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER || typeId == _TYPEID_LSP7_TOKENSRECIPIENT) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP7;
            isReceiving = typeId == _TYPEID_LSP7_TOKENSRECIPIENT ? true : false;
        } else if (typeId == _TYPEID_LSP8_TOKENSSENDER || typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            mapPrefix = _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP8;
            isReceiving = typeId == _TYPEID_LSP8_TOKENSRECIPIENT ? true : false;
        } else if (
            typeId == _TYPEID_LSP14_OwnershipTransferred_SenderNotification ||
            typeId == _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
        ) {
            mapPrefix = _LSP10_VAULTS_MAP_KEY_PREFIX;
            interfaceId = _INTERFACEID_LSP9;
            isReceiving = typeId == _TYPEID_LSP14_OwnershipTransferred_RecipientNotification
                ? true
                : false;
        } else {
            invalid = true;
        }
    }
}
