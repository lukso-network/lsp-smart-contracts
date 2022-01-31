// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP1UniversalReceiverDelegateVaultCore.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title Inheritable Proxy Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
abstract contract LSP1UniversalReceiverDelegateVaultInitAbstract is
    Initializable,
    LSP1UniversalReceiverDelegateVaultCore
{
    /**
     * @notice Register the LSP1UniversalReceiverDelegate InterfaceId
     */
    function initialize() public virtual onlyInitializing {
        _registerInterface(_INTERFACEID_LSP1_DELEGATE);
    }
}
