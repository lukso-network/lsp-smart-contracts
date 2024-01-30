// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when trying to renounce ownership before the initial confirmation delay.
 * @notice Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.
 *
 * @param renounceOwnershipStart The start timestamp when one can confirm the renouncement of ownership.
 * @param renounceOwnershipEnd The end timestamp when one can confirm the renouncement of ownership.
 */
error LSP14NotInRenounceOwnershipInterval(
    uint256 renounceOwnershipStart,
    uint256 renounceOwnershipEnd
);

/**
 * @dev Reverts when trying to transfer ownership to the `address(this)`.
 * @notice Cannot transfer ownership to the address of the contract itself.
 */
error LSP14CannotTransferOwnershipToSelf();

/**
 * @dev Reverts when pending owner accept ownership in the same transaction of transferring ownership.
 * @notice Cannot accept ownership in the same transaction with {transferOwnership(...)}.
 */
error LSP14MustAcceptOwnershipInSeparateTransaction();

/**
 * @dev Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.
 * @param caller The address that tried to accept ownership.
 */
error LSP14CallerNotPendingOwner(address caller);
