// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {LSP9VaultCore, ClaimOwnership} from "./LSP9VaultCore.sol";

// constants
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9, _LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE} from "../LSP9Vault/LSP9Constants.sol";

/**
 * @title Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9Vault is LSP9VaultCore {
    /**
     * @notice Sets the owner of the contract and sets the SupportedStandards:LSP9Vault key
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) {
        OwnableUnset._setOwner(newOwner);

        // set key SupportedStandards:LSP9Vault
        _setData(_LSP9_SUPPORTED_STANDARDS_KEY, _LSP9_SUPPORTED_STANDARDS_VALUE);

        _notifyVaultReceiver(newOwner);
    }
}
