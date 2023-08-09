// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev reverts when trying to renounce ownership before the initial confirmation delay
 */
error NotInRenounceOwnershipInterval(
    uint256 renounceOwnershipStart,
    uint256 renounceOwnershipEnd
);

/**
 * @dev reverts when trying to transfer ownership to the address(this)
 */
error CannotTransferOwnershipToSelf();

/**
 * @dev reverts when pending owner accept ownership in the same transaction of transferring ownership
 */
error LSP14MustAcceptOwnershipInSeparateTransaction();
