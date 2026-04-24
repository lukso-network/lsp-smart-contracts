// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/**
 * @dev Reverts when an address attempts a role-gated action and is missing the `neededRole`.
 *
 * @param account The address that attempted the action.
 * @param neededRole The role that was required.
 */
error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

/**
 * @dev Reverts when the caller of the `renounceRole` function is not the expected one.
 * NOTE: Do not confuse with {AccessControlUnauthorizedAccount}.
 */
error AccessControlBadConfirmation();

/**
 * @dev Reverts when trying to change the admin of the `DEFAULT_ADMIN_ROLE`.
 * The `DEFAULT_ADMIN_ROLE` is its own admin, meaning only accounts with the `DEFAULT_ADMIN_ROLE` can grant or revoke it.
 * This hierarchy cannot be changed.
 */
error AccessControlCannotSetAdminForDefaultAdminRole();
