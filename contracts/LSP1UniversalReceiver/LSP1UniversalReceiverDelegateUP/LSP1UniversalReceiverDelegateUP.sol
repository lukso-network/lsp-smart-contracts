// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP1UniversalReceiverDelegateUPCore.sol";

/**
 * @title Implementation of contract writing the received Vaults and LSP7, LSP8 assets into your ERC725Account using
 *        the LSP5-ReceivedAsset and LSP10-ReceivedVaults standard and removing the sent vaults and assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
contract LSP1UniversalReceiverDelegateUP is
    LSP1UniversalReceiverDelegateUPCore
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }
}
