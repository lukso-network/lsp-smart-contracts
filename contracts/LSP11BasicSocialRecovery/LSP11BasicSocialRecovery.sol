// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP11BasicSocialRecoveryCore} from "./LSP11BasicSocialRecoveryCore.sol";

/**
 * @title Implementation of LSP11 - Basic Social Recovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
contract LSP11BasicSocialRecovery is LSP11BasicSocialRecoveryCore {
    /**
     * @notice link the contract with an ERC725 contract at address: `_account` and set `_account` as the owner.
     * @param _account The address of the ER725 contract to recover and the owner of the contract
     */
    constructor(address _account) {
        account = _account;
        OwnableUnset._setOwner(_account);
    }
}
