// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP11SocialRecoveryCore.sol";

/**
 * @title Implementation of LSP11-SocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
contract LSP11SocialRecovery is ERC165Storage, LSP11SocialRecoveryCore {
    /**
     * @notice Initiate the contract with the address of the ERC725 contract, set the owner, the recover threshold
     * and register LSP11SocialRecovery InterfaceId
     * @param _account The address of the ER725 contract to recover
     * @param newOwner The address to control the social recovery contract
     * @param newThreshold The minimum number of votes needed to add an address as an owner
     * controller of the account through the KeyManager
     */
    constructor(
        address newOwner,
        address _account,
        uint256 newThreshold
    ) {
        account = ERC725(_account);

        if (newOwner != owner()) {
            OwnableUnset.initOwner(newOwner);
        }

        recoverThreshold = newThreshold;
        _registerInterface(_INTERFACEID_LSP11);
    }
}
