// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/**
 * @dev The guardian address already exists for the account.
 * @param account The account trying to add the guardian.
 * @param guardian The guardian address that already exists.
 */
error GuardianAlreadyExists(address account, address guardian);

/**
 * @dev The specified guardian address does not exist for the account.
 * @param account The account trying to remove the guardian.
 * @param guardian The guardian address that was not found.
 */
error GuardianNotFound(address account, address guardian);

/**
 * @dev The caller is not a guardian for the account.
 * @param guardian Expected guardian address.
 * @param caller Address of the caller.
 */
error CallerIsNotGuardian(address guardian, address caller);

/**
 * @dev The caller is not the account holder.
 * @param account The expected account holder.
 * @param caller Address of the caller.
 */
error CallerIsNotTheAccount(address account, address caller);

/**
 * @dev One or more batch calls failed.
 * @param iteration The iteration at which the batch call failed.
 */
error BatchCallsFailed(uint256 iteration);

/**
 * @dev The caller is not the expected recoverer.
 * @param recoverer Expected recoverer address.
 * @param caller Address of the caller.
 */
error CallerIsNotRecoverer(address recoverer, address caller);

/**
 * @dev The specified threshold exceeds the number of guardians.
 * @param account The account trying to set the threshold.
 * @param threshold The threshold value that exceeds the number of guardians.
 */
error ThresholdExceedsGuardianNumber(address account, uint256 threshold);

/**
 * @dev Removing the guardian would violate the guardian threshold.
 * @param account The account trying to remove the guardian.
 * @param threshold The guardian address that would cause a threshold violation if removed.
 */
error GuardianNumberCannotGoBelowThreshold(address account, uint256 threshold);

/**
 * @dev The secret guardian hash already exists for the account.
 * @param account The account trying to add the secret guardian.
 * @param secretGuardian The secret guardian hash that already exists.
 */
error SecretGuardianAlreadyExists(address account, bytes32 secretGuardian);

/**
 * @dev The specified secret guardian hash does not exist for the account.
 * @param account The account trying to remove the secret guardian.
 * @param secretGuardian The secret guardian hash that was not found.
 */
error SecretGuardianNotFound(address account, bytes32 secretGuardian);

/**
 * @dev Guardian is not authorized to vote for the account.
 * @param account The account for which the vote is being cast.
 * @param recoverer the caller
 */
error CallerVotesHaveNotReachedThreshold(address account, address recoverer);

/**
 * @dev The account has not been set up yet.
 */
error AccountNotSetupYet();

/**
 * @dev The caller is not a guardian for the account.
 * @param account The account in question.
 * @param caller Address of the caller.
 */
error CallerIsNotAGuardianOfTheAccount(address account, address caller);

/**
 * @dev A guardian cannot vote for the same address twice.
 * @param account The account for which the vote is being cast.
 * @param guardian The guardian casting the vote.
 * @param guardianVotedAddress The address voted by the guardian for recovery.
 */
error CannotVoteToAddressTwice(
    address account,
    address guardian,
    address guardianVotedAddress
);

/**
 * @dev The voted address did not meet the recovery requirements.
 * @param account The account for which recovery is being attempted.
 * @param votedAddress The address that was voted for recovery.
 */
error InvalidRecovery(address account, address votedAddress);

/**
 * @dev The commitment provided is not valid.
 * @param account The account for which the commitment is being checked.
 * @param committer The address providing the commitment.
 */
error InvalidCommitment(address account, address committer);

/**
 * @dev The provided secret hash is not valid for recovery.
 * @param account The account for which recovery is being attempted.
 * @param secretHash The invalid secret hash provided.
 */
error InvalidSecretHash(address account, bytes32 secretHash);

/**
 * @dev The commitment provided is too early.
 * @param account The account for which the commitment is being checked.
 * @param committer The address providing the commitment.
 */
error CannotRecoverAfterDirectCommit(address account, address committer);

error InvalidSignature();

error CannotRecoverBeforeDelay(address, uint256);
