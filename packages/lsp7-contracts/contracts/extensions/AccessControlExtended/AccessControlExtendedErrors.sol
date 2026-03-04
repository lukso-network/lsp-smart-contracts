// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/**
 * @dev Reverts when an address attempts a role-gated action without holding the required role
 * and is not the contract owner or an address with the DEFAULT_ADMIN_ROLE.
 *
 * @param account The address that attempted the action.
 * @param role The role that was required.
 */
error AccessControlExtendedUnauthorized(address account, bytes32 role);

/**
 * @dev Reverts when `renounceRole` is called with a `callerConfirmation` address
 * that does not match `msg.sender`. Mirrors OZ's `AccessControlBadConfirmation`.
 *
 * @param caller The address that called `renounceRole`.
 * @param account The address that was provided to renounce the role for.
 */
error AccessControlExtendedCanOnlyRenounceForSelf(
    address caller,
    address account
);
