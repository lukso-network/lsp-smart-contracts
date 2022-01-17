// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP9VaultInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultInit is LSP9VaultInitAbstract {
    /**
     * @inheritdoc LSP9VaultInitAbstract
     */
    function initialize(address _newOwner) public override initializer {
        LSP9VaultInitAbstract.initialize(_newOwner);
    }
}
