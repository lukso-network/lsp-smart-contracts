// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// --- Errors

/**
 * @dev reverts when the caller is not a guardian
 */
error CallerIsNotGuardian(address caller);

/**
 * @dev reverts when adding an already existing guardian
 */
error GuardianAlreadyExist(address addressToAdd);

/**
 * @dev reverts when removing a non-existing guardian
 */
error GuardianDoNotExist(address addressToRemove);

/**
 * @dev reverts when removing a guardian and the threshold
 * is equal to the number of guardians
 */
error GuardiansNumberCannotGoBelowThreshold(uint256 guardianThreshold);

/**
 * @dev reverts when setting the guardians threshold to a number
 * higher than the guardians number
 */
error ThresholdCannotBeHigherThanGuardiansNumber(
    uint256 thresholdGiven,
    uint256 guardianNumber
);

/**
 * @dev reverts when the secret hash provided is equal to bytes32(0)
 */
error SecretHashCannotBeZero();

/**
 * @dev reverts when `recoverOwnership(..)` is called with a recoverer that didn't reach
 * the guardians threshold
 * @param recoverer The address of the recoverer
 * @param selections The number of selections that the recoverer have
 * @param guardiansThreshold The minimum number of selection needed
 */
error ThresholdNotReachedForRecoverer(
    address recoverer,
    uint256 selections,
    uint256 guardiansThreshold
);

/**
 * @dev reverts when the plain secret produce a different hash than the
 * secret hash originally set
 */
error WrongPlainSecret();

/**
 * @dev reverts when the address zero calls `recoverOwnership(..)` function
 */
error AddressZeroNotAllowed();
