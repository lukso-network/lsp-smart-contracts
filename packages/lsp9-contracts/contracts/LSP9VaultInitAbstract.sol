// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
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
 * @title Inheritable Proxy Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
abstract contract LSP9VaultInitAbstract is Initializable, LSP9VaultCore {
    using LSP1Utils for address;

    /**
     * @dev Sets `initialOwner` as the contract owner and the `SupportedStandards:LSP9Vault` Data Key. The `constructor` also allows funding the contract on deployment.
     *
     * @param newOwner The new owner of the contract.
     *
     * @custom:warning ERC725X & ERC725Y parent contracts are not initialised as they don't have non-zero initial state. If you decide to add non-zero initial state to any of those contracts, you must initialize them here.
     *
     * @custom:events
     * - {UniversalReceiver} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when updating the {_LSP9_SUPPORTED_STANDARDS_KEY}.
     * - {UniversalReceiver} event when notifying the `initialOwner`.
     */
    function _initialize(address newOwner) internal virtual onlyInitializing {
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
