// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP9VaultInitAbstract} from "./LSP9VaultInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultInit is LSP9VaultInitAbstract {
    /**
     * @dev Get the version of the contract.
     * @notice Contract version.
     */
    // DO NOT CHANGE
    // Comments block below is used by release-please to automatically update the version in this file.
    // x-release-please-start-version
    string public constant VERSION = "0.12.0";

    // x-release-please-end

    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a LSP9Vault contract with owner set to address `initialOwner`.
     * @dev Sets `initialOwner` as the contract owner and the `SupportedStandards:LSP9Vault` Data Key. The `initialize(address)` also allows funding the contract on deployment.
     *
     * @param newOwner The new owner of the contract.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when updating the {_LSP9_SUPPORTED_STANDARDS_KEY}.
     * - {UniversalReceiver} event when notifying the `initialOwner`.
     */
    function initialize(address newOwner) external payable virtual initializer {
        LSP9VaultInitAbstract._initialize(newOwner);
    }
}
