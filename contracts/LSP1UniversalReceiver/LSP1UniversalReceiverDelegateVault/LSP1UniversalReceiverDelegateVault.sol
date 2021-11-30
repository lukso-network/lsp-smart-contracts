// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP1UniversalReceiverDelegateVaultCore.sol";

/**
 * @title Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
contract LSP1UniversalReceiverDelegateVault is
    LSP1UniversalReceiverDelegateVaultCore
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }
}
