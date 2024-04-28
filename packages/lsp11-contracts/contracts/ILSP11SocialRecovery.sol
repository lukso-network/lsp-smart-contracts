// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

/**
 * @title ILSP11SocialRecovery
 * @notice Contract providing a mechanism for account recovery through a designated set of guardians.
 */
interface ILSP11SocialRecovery {
    /**
     * @notice Event emitted when a guardian is added for an account.
     * @param account The account for which the guardian is being added.
     * @param guardian The address of the new guardian being added.
     */
    event GuardianAdded(address indexed account, address indexed guardian);

    /**
     * @notice Event emitted when a guardian is removed for an account.
     * @param account The account from which the guardian is being removed.
     * @param guardian The address of the guardian being removed.
     */
    event GuardianRemoved(address indexed account, address indexed guardian);

    /**
     * @notice Event emitted when the guardian threshold for an account is changed.
     * @param account The account for which the guardian threshold is being changed.
     * @param guardianThreshold The new guardian threshold for the account.
     */
    event GuardiansThresholdChanged(
        address indexed account,
        uint256 indexed guardianThreshold
    );

    /**
     * @notice Event emitted when the secret hash associated with an account is changed.
     * @param account The account for which the secret hash is being changed.
     * @param secretHash The new secret hash for the account.
     */
    event SecretHashChanged(
        address indexed account,
        bytes32 indexed secretHash
    );

    /**
     * @notice Event emitted when the recovery delay associated with an account is changed.
     * @param account The account for which the recovery delay is being changed.
     * @param recoveryDelay The new recovery delay for the account in seconds.
     */
    event RecoveryDelayChanged(
        address indexed account,
        uint256 indexed recoveryDelay
    );

    /**
     * @notice Event emitted when a guardian votes for an address to be recovered.
     * @param account The account for which the vote is being cast.
     * @param recoveryCounter The recovery counter at the time of voting.
     * @param guardian The guardian casting the vote.
     * @param guardianVotedAddress The address voted by the guardian for recovery.
     */
    event GuardianVotedFor(
        address indexed account,
        uint256 recoveryCounter,
        address indexed guardian,
        address indexed guardianVotedAddress
    );

    /**
     * @notice Event emitted when a recovery process is cancelled for an account.
     * @param account The account for which the recovery process was cancelled.
     * @param previousRecoveryCounter The recovery counter before cancellation.
     */
    event RecoveryCancelled(
        address indexed account,
        uint256 indexed previousRecoveryCounter
    );

    /**
     * @notice Event emitted when an address commits a secret hash to recover an account.
     * @param account The account for which the secret hash is being committed.
     * @param recoveryCounter The recovery counter at the time of the commitment.
     * @param committedBy The address who made the commitment.
     * @param commitment The commitment associated with the secret hash.
     */
    event SecretHashCommitted(
        address indexed account,
        uint256 recoveryCounter,
        address indexed committedBy,
        bytes32 indexed commitment
    );

    /**
     * @notice Event emitted when a recovery process is successful for an account.
     * @param account The account for which the recovery process was successful.
     * @param recoveryCounter The recovery counter at the time of successful recovery.
     * @param guardianVotedAddress The address voted by guardians for the successful recovery.
     * @param calldataExecuted The calldata executed on the account recovered.
     */
    event RecoveryProcessSuccessful(
        address indexed account,
        uint256 indexed recoveryCounter,
        address indexed guardianVotedAddress,
        bytes calldataExecuted
    );

    /**
     * @notice Get the array of addresses representing guardians associated with an account.
     * @param account The account for which guardians are queried.
     * @return An array of addresses representing guardians for the given account.
     */
    function getGuardiansOf(
        address account
    ) external view returns (address[] memory);

    /**
     * @notice Check if an address is a guardian for a specific account.
     * @param account The account to check for guardian status.
     * @param guardianAddress The address to verify if it's a guardian for the given account..
     * @return A boolean indicating whether the address is a guardian for the given account.
     */
    function isGuardianOf(
        address account,
        address guardianAddress
    ) external view returns (bool);

    /**
     * @notice Get the guardian threshold for a specific account.
     * @param account The account for which the guardian threshold is queried.
     * @return The guardian threshold set for the given account.
     */
    function getGuardiansThresholdOf(
        address account
    ) external view returns (uint256);

    /**
     * @notice Get the secret hash associated with a specific account.
     * @param account The account for which the secret hash is queried.
     * @return The secret hash associated with the given account.
     */
    function getSecretHashOf(address account) external view returns (bytes32);

    /**
     * @notice Get the recovery delay associated with a specific account.
     * @param account The account for which the recovery delay is queried.
     * @return The recovery delay associated with the given account.
     */
    function getRecoveryDelayOf(
        address account
    ) external view returns (uint256);

    /**
     * @notice Get the successful recovery counter for a specific account.
     * @param account The account for which the recovery counter is queried.
     * @return The successful recovery counter for the given account.
     */
    function getRecoveryCounterOf(
        address account
    ) external view returns (uint256);

    /**
     * @notice Get the timestamp of the first recovery timestamp of the vote for a specific account and recovery counter.
     * @param account The account for which the vote is queried.
     * @param recoveryCounter The recovery counter for which the vote is queried.
     * @return The timestamp of the first recovery timestamp of the vote for a specific account and recovery counter.
     */
    function getFirstRecoveryTimestampOf(
        address account,
        uint256 recoveryCounter
    ) external view returns (uint256);

    /**
     * @notice Get the address voted for recovery by a guardian for a specific account and recovery counter.
     * @param account The account for which the vote is queried.
     * @param recoveryCounter The recovery counter for which the vote is queried.
     * @param guardian The guardian whose vote is queried.
     * @return The address voted for recovery by the specified guardian for the given account and recovery counter.
     */
    function getVotedAddressByGuardian(
        address account,
        uint256 recoveryCounter,
        address guardian
    ) external view returns (address);

    /**
     * @notice Get the number of votes an address has received from guardians for a specific account and recovery counter.
     * @param account The account for which the votes are queried.
     * @param recoveryCounter The recovery counter for which the votes are queried.
     * @param votedAddress The address for which the votes are queried.
     * @return The number of votes the specified address has received from guardians for the given account and recovery counter.
     */
    function getVotesOfGuardianVotedAddress(
        address account,
        uint256 recoveryCounter,
        address votedAddress
    ) external view returns (uint256);

    /**
     * @notice Checks if the votes received by a given address from guardians have reached the threshold necessary for account recovery.
     * @param account The account for which the threshold check is performed.
     * @param recoveryCounter The recovery counter for which the threshold check is performed.
     * @param votedAddress The address for which the votes are counted.
     * @return A boolean indicating whether the votes for the specified address have reached the necessary threshold for the given account and recovery counter.
     * @dev This function evaluates if the number of votes from guardians for a specific voted address meets or exceeds the required threshold for account recovery.
     * This is part of the account recovery process where guardians vote for the legitimacy of a recovery address.
     */
    function hasReachedThreshold(
        address account,
        uint256 recoveryCounter,
        address votedAddress
    ) external view returns (bool);

    /**
     * @notice Get the commitment associated with an address for recovery for a specific account and recovery counter.
     * @param account The account for which the commitment is queried.
     * @param recoveryCounter The recovery counter for which the commitment is queried.
     * @param committedBy The address who made the commitment.
     * @return The commitment associated with the specified address for recovery for the given account and recovery counter.
     */
    function getCommitmentInfoOf(
        address account,
        uint256 recoveryCounter,
        address committedBy
    ) external view returns (bytes32, uint256);

    /**
     * @notice Adds a new guardian to the calling account.
     * @param newGuardian The address of the new guardian to be added.
     * @dev This function allows the account holder to add a new guardian to their account.
     * If the provided address is already a guardian for the account, the function will revert.
     * Emits a `GuardianAdded` event upon successful addition of the guardian.
     */
    function addGuardian(address account, address newGuardian) external;

    /**
     * @notice Removes an existing guardian from the calling account.
     * @param existingGuardian The address of the existing guardian to be removed.
     * @dev This function allows the account holder to remove an existing guardian from their account.
     * If the provided address is not a current guardian or the removal would violate the guardian threshold, the function will revert.
     * Emits a `GuardianRemoved` event upon successful removal of the guardian.
     */
    function removeGuardian(address account, address existingGuardian) external;

    /**
     * @notice Sets the guardian threshold for the calling account.
     * @param newThreshold The new guardian threshold to be set for the calling account.
     * @dev This function allows the account holder to set the guardian threshold for their account.
     * If the provided threshold exceeds the number of current guardians, the function will revert.
     * Emits a `GuardiansThresholdChanged` event upon successful threshold modification.
     */
    function setGuardiansThreshold(
        address account,
        uint256 newThreshold
    ) external;

    /**
     * @notice Sets the recovery secret hash for the calling account.
     * @param newRecoverSecretHash The new recovery secret hash to be set for the calling account.
     * @dev This function allows the account holder to set a new recovery secret hash for their account.
     * If the provided secret hash is zero, the function will revert.
     * Emits a `SecretHashChanged` event upon successful secret hash modification.
     */
    function setRecoverySecretHash(
        address account,
        bytes32 newRecoverSecretHash
    ) external;

    /**
     * @notice Sets the recovery delay for the calling account.
     * @param account The address of the account to which the recovery delay will be set.
     * @param recoveryDelay The new recovery delay to be set for the calling account.
     * @dev This function allows the account to set a new recovery delay for their account.
     * Emits a `RecoveryDelayChanged` event upon successful secret hash modification.
     */
    function setRecoveryDelay(address account, uint256 recoveryDelay) external;

    /**
     * @notice Allows a guardian to vote for an address to be recovered.
     * @param account The account for which the vote is being cast.
     * @param guardianVotedAddress The address voted by the guardian for recovery.
     * @dev This function allows a guardian to vote for an address to be recovered in a recovery process.
     * If the guardian has already voted for the provided address, the function will revert.
     * Emits a `GuardianVotedFor` event upon successful vote.
     */
    function voteForRecovery(
        address account,
        address guardian,
        address guardianVotedAddress
    ) external;

    /**
     * @notice Commits a secret hash for an address to be recovered.
     * @param account The account for which the secret hash is being committed.
     * @param commitment The commitment associated with the secret hash.
     * @dev This function allows an address to commit a secret hash for the recovery process.
     * If the guardian has not voted for the provided address, the function will revert.
     */
    function commitToRecover(
        address account,
        address votedAddress,
        bytes32 commitment
    ) external;

    /**
     * @notice Initiates the account recovery process.
     * @param account The account for which the recovery is being initiated.
     * @param secretHash The hash associated with the recovery process.
     * @param newSecretHash The new secret hash to be set for the account.
     * @param calldataToExecute The calldata to be executed during the recovery process.
     * @dev This function initiates the account recovery process and executes the provided calldata.
     * If the new secret hash is zero or the number of votes is less than the guardian threshold, the function will revert.
     * Emits a `RecoveryProcessSuccessful` event upon successful recovery process.
     */
    function recoverAccess(
        address votedAddress,
        address account,
        bytes32 secretHash,
        bytes32 newSecretHash,
        bytes calldata calldataToExecute
    ) external payable returns (bytes memory);

    /**
     * @notice Cancels the ongoing recovery process for the account by increasing the recovery counter.
     * @dev This function allows the account holder to cancel the ongoing recovery process by incrementing the recovery counter.
     * Emits a `RecoveryCancelled` event upon successful cancellation of the recovery process.
     */
    function cancelRecoveryProcess(address account) external;
}
