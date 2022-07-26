// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title interface of the LSP11 - Basic Social Recovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Recovers the permission of a controller address to interact with an ERC725 contract via the LSP6KeyManager
 */
interface ILSP11BasicSocialRecovery {
    /**
     * @dev The address of an ERC725 contract where we want to recover
     * the permissions for a controller address.
     */
    function account() external view returns (address);

    /**
     * @dev Returns the addresses of all guardians
     * The guardians will vote for an address to be added as a controller
     * key for the linked `account`.
     */
    function getGuardians() external view returns (address[] memory);

    /**
     * @dev Returns TRUE if the `_address` provided is a guardian, FALSE otherwise
     */
    function isGuardian(address _address) external view returns (bool);

    /**
     * @dev Returns all the RecoverProcessesIds
     * The RecoverProcessesIds are the channels that guardians can vote on if the
     * guardians didn't reach consensus on an address in one recover process id they
     * can start voting on another one.
     */
    function getRecoverProcessesIds() external view returns (bytes32[] memory);

    /**
     * @dev Returns the guardian threshold
     * The guardian threshold represents the minimum number of guardians required
     * to vote in order to start a recovery process.
     */
    function getGuardiansThreshold() external view returns (uint256);

    /**
     * @dev Get the address of a controller that a `guardian` voted for in order to recover its permissions.
     * @param recoverProcessId the id of the recoverProcess to search for
     * @param guardian the address of a guardian to check votes for
     * @return the address of the controller that `guardian` voted for.
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
     * @dev Sets the minimum number of guardians required to vote so that a
     * controller address can recover ownership
     *
     * @dev Can be called only by the owner
     * @param guardiansThreshold The threshold to set
     *
     * Requirements:
     *
     * - `guardiansThreshold` cannot be 0
     * - `guardiansThreshold` cannot be more than the guardiansCount
     */
    function setThreshold(uint256 guardiansThreshold) external;

    /**
     * @dev submit a vote to allow an address `newOwner` to recover its owner
     * permissions once the votes threshold is reached.
     *
     * @dev only guardians can submit votes
     * @param recoverProcessId The recoverProcessId to submit votes in
     * @param newOwner The controller address to vote for so that it can recover its permissions
     */
    function voteToRecover(bytes32 recoverProcessId, address newOwner) external;

    /**
     * @dev Recovers the ownership permissions of an address in the linked `account()`
     * and increment the recover counter
     *
     * Requirements
     *     - the address of the caller must have at least received the minimum number of votes defined in `getGuardiansThreshold(...)`
     *     - the address must have provided the right `plainSecret` that produces the secret Hash
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
