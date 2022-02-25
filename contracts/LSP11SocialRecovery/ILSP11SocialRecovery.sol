// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// prettier-ignore

/**
 * @title The interface for LSP11SocialRecovery contract
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
interface ILSP11SocialRecovery {
    /**
     * @notice Adds a guardian of the owner
     * @dev Can be called only by the owner
     * @param newGuardian The address to add as a guardian
     */
    function addGuardian(address newGuardian) external;

    /**
     * @notice Removes a guardian of the owner
     * @dev Can be called only by the owner
     * @param currentGuardian The address of the existing guardian to remove
     */
    function removeGuardian(address currentGuardian) external;

    /**
     * @notice Sets the hash of the secret word to be provided in *recoverOwnership* function
     * @dev Can be called only by the owner
     * @param newHash The hash of the secret word
     */
    function setSecret(bytes32 newHash) external;

    /**
     * @notice Sets the minimum number of votes that an address should have
     * in order to recover Ownership
     *
     * @dev Can be called only by the owner
     * @param newThreshold The threshold to set
     */
    function setThreshold(uint256 newThreshold) external;

    /**
     * @notice Votes for an address to be granted the owner permissions
     * when he reach the recover threshold
     *
     * @dev Can be called only by the guardians
     * @param newOwner The address to vote for
     */
    function startRecovery(address newOwner) external;

    /**
     * @notice Recovers the ownership permissions in the ERC725 contract to recover
     * and increment the recover counter
     *
     * @dev Can be called only by the address that have votes >= threshold
     * and provided the right secret that produce the secret Hash
     *
     * @param plainSecret The secret word that produce the secret Hash
     * @param newHash The new secret Hash to be used in the next recovery process
     */
    function recoverOwnership(string memory plainSecret, bytes32 newHash) external;
}
