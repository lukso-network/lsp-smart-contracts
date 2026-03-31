// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/**
 * @dev Reverts when an address attempts a role-gated action and is missing the `neededRole`.
 * Also applies if `account` is not the contract owner or an address with the DEFAULT_ADMIN_ROLE.
 *
 * @param account The address that attempted the action.
 * @param neededRole The role that was required.
 */
error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

/**
 * @dev Reverts error when the caller of the `renounceRole` function is not the expected one.
 * NOTE: Do not confuse with {AccessControlUnauthorizedAccount}.
 */
error AccessControlBadConfirmation();
