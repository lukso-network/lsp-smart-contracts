// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {Version} from "./Version.sol";
import {LSP9VaultCore} from "./LSP9VaultCore.sol";

// libraries
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";

// constants
import {
    _LSP9_SUPPORTED_STANDARDS_KEY,
    _LSP9_SUPPORTED_STANDARDS_VALUE,
    _TYPEID_LSP9_VALUE_RECEIVED,
    _TYPEID_LSP9_OwnershipTransferred_RecipientNotification
} from "./LSP9Constants.sol";

/**
 * @title Implementation of LSP9Vault built on top of [ERC725], [LSP-1-UniversalReceiver]
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by an EOA or by a contract and is able to receive and send assets. Also allows for registering received assets by leveraging the key-value storage.
 */
contract LSP9Vault is LSP9VaultCore, Version {
    using LSP1Utils for address;

    /**
     * @notice Deploying a LSP9Vault contract with owner set to address `initialOwner`.
     * @dev Sets `initialOwner` as the contract owner and the `SupportedStandards:LSP9Vault` Data Key. The `constructor` also allows funding the contract on deployment.
     *
     * @param newOwner The new owner of the contract.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when setting the {_LSP9_SUPPORTED_STANDARDS_KEY}.
     * - {UniversalReceiver} event when notifying the `initialOwner`.
     */
    constructor(address newOwner) payable {
        if (msg.value != 0) {
            emit UniversalReceiver(
                msg.sender,
                msg.value,
                _TYPEID_LSP9_VALUE_RECEIVED,
                "",
                ""
            );
        }

        OwnableUnset._setOwner(newOwner);

        // set key SupportedStandards:LSP9Vault
        _setData(
            _LSP9_SUPPORTED_STANDARDS_KEY,
            _LSP9_SUPPORTED_STANDARDS_VALUE
        );

        newOwner.notifyUniversalReceiver(
            _TYPEID_LSP9_OwnershipTransferred_RecipientNotification,
            ""
        );
    }
}
