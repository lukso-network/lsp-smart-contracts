// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "./Handling/TokenHandling.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "../ILSP1UniversalReceiverDelegate.sol";

/**
 * @title Core Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
abstract contract LSP1UniversalReceiverDelegateVaultCore is
    ILSP1UniversalReceiverDelegate,
    ERC165Storage,
    TokenHandlingContract
{
    /**
     * @dev allows to register arrayKeys and Map of incoming assets and remove them on balance = 0
     * @param sender token address
     * @param typeId token hooks
     * @param data concatenated data about token transfer
     * @return result the return value
     */
    function universalReceiverDelegate(
        address sender,
        bytes32 typeId,
        bytes memory data
    ) public override returns (bytes memory result) {
        if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSSENDER ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT
        ) {
            result = _tokenHandling(sender, typeId, data);
        }
    }
}
