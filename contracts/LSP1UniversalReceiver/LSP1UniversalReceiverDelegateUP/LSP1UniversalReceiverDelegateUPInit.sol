// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP1UniversalReceiverDelegateUPInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of contract writing the received Vaults and LSP7, LSP8 assets into your ERC725Account using
 *        the LSP5-ReceivedAsset and LSP10-ReceivedVaults standard and removing the sent vaults and assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 *
 * Owner of the UniversalProfile MUST be a KeyManager that allows (this) address to setData on the UniversalProfile
 *
 */
contract LSP1UniversalReceiverDelegateUPInit is
    LSP1UniversalReceiverDelegateUPInitAbstract
{
    /**
     * @inheritdoc LSP1UniversalReceiverDelegateUPInitAbstract
     */
    function initialize() public virtual override initializer {
        LSP1UniversalReceiverDelegateUPInitAbstract.initialize();
    }
}
