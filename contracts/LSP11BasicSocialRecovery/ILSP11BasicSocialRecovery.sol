// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// prettier-ignore

import "@erc725/smart-contracts/contracts/ERC725.sol";

/**
 * @title The implementation interface for LSP11-BasicSocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
interface ILSP11BasicSocialRecovery {
    /**
     * @dev The account to recover
     */
    function account() external view returns (address);

    /**
     * @dev Returns the address of all guardians
     */
    function getGuardians() external view returns (address[] memory);

    /**
     * @dev Returns TRUE if the address provided is a guardian, FALSE otherwise
     */
    function isGuardian(address _address) external view returns (bool);

    /**
     * @dev Returns all the RecoverProcessesIds
     */
    function getRecoverProcessesIds() external view returns (bytes32[] memory);

    /**
     * @dev Returns the guardian threshold
     */
    function getGuardiansThreshold() external view returns (uint256);

    /**
     * @dev Returns the address voted for by the provided guardian in the
     * provided recoverProcessId
     */
    function getGuardianVote(bytes32 recoverProcessId, address guardian)
        external
        view
        returns (address);

    /**
     * @dev Adds a guardian of the owner
     * @dev Can be called only by the owner
     * @param newGuardian The address to add as a guardian
     */
    function addGuardian(address newGuardian) external;

    /**
     * @dev Removes a guardian of the owner
     * @dev Can be called only by the owner
     * @param currentGuardian The address of the existing guardian to remove
     *
     * Requirements:
     *
     * - The guardians count should be higher or equal to the guardain threshold
     */
    function removeGuardian(address currentGuardian) external;

    /**
     * @dev Sets the hash of the secret word to be provided in *recoverOwnership* function
     * @dev Can be called only by the owner
     * @param secretHash The hash of the secret word
     *
     * Requirements:
     *
     * - `secretHash` cannot be bytes32(0)
     */
    function setSecret(bytes32 secretHash) external;

    /**
     * @dev Sets the minimum number of votes that an address should have
     * in order to recover Ownership
     *
     * @dev Can be called only by the owner
     * @param _guardiansThreshold The threshold to set
     *
     * Requirements:
     *
     * - `_guardiansThreshold` cannot be 0
     * - `_guardiansThreshold` cannot be more than the guardiansCount
     */
    function setThreshold(uint256 _guardiansThreshold) external;

    /**
     * @dev Votes for an address to be granted the owner permissions
     * when he reach the recover threshold
     *
     * @dev Can be called only by the guardians
     * @param recoverProcessId The recoverProcessId to vote in
     * @param newOwner The address to vote for
     */
    function voteToRecover(bytes32 recoverProcessId, address newOwner) external;

    /**
     * @dev Recovers the ownership permissions in the ERC725 contract to recover
     * and increment the recover counter
     *
     * @dev Can be called only by the address that have votes >= threshold
     * and provided the right secret that produce the secret Hash
     *
     * @param recoverProcessId The recoverProcessId to recover in
     * @param plainSecret The secret word that produce the secret Hash
     * @param newHash The new secret Hash to be used in the next recovery process
     */
    function recoverOwnership(
        bytes32 recoverProcessId,
        string memory plainSecret,
        bytes32 newHash
    ) external;
}
