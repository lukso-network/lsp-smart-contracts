// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// interfaces
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

/**
 * @title IAccessControlExtended
 * @dev Interface extending IAccessControlEnumerable with reverse role lookups
 * and auxiliary data storage per role-address pair.
 *
 * Inherits all functions from {IAccessControl} and {IAccessControlEnumerable}:
 */
interface IAccessControlExtended is IAccessControlEnumerable {
    /**
     * @dev Emitted when auxiliary data is set or cleared for a role-address pair.
     * @param role The role identifier.
     * @param account The account address whose data was changed.
     * @param data The new data (empty bytes when data is cleared).
     */
    event RoleDataChanged(
        bytes32 indexed role,
        address indexed account,
        bytes data
    );

    /**
     * @notice Returns all members that hold `role`.
     *
     * @dev Convenience function that returns the full membership array in a single call.
     * Equivalent to calling {getRoleMember} for each index from `0` to
     * `getRoleMemberCount(role) - 1`.
     *
     * @param role The role identifier to query members for.
     * @return An array of addresses that currently hold the specified role.
     *
     * @custom:warning This function copies the entire role membership set into memory.
     * For roles with a large number of members, this may consume a significant amount of gas
     * and could exceed the block gas limit. Consider using {getRoleMember} with pagination
     * for large sets. This is primarily intended for off-chain / view-context usage.
     */
    function getRoleMembers(
        bytes32 role
    ) external view returns (address[] memory);

    /**
     * @notice Returns all roles assigned to `account`.
     * @dev Uses a reverse lookup to enumerate all roles held by a given address.
     * @param account The address to query roles for.
     * @return An array of role identifiers assigned to the account.
     */
    function rolesOf(address account) external view returns (bytes32[] memory);

    /**
     * @notice Grants `role` to `account` and stores auxiliary `data` associated with the role-address pair.
     * @dev If `account` already holds the role, only the data is updated.
     *
     * @custom:requirements Caller must have the admin role for `role`.
     *
     * @param role The role identifier to grant.
     * @param account The address to grant the role to.
     * @param data Auxiliary data to store for this role-address pair.
     *
     * @custom:events
     * - {RoleGranted} if the role was newly granted.
     * - {RoleDataChanged} if `data` is non-empty or if data was updated.
     */
    function grantRoleWithData(
        bytes32 role,
        address account,
        bytes calldata data
    ) external;

    /**
     * @notice Sets auxiliary `data` for a `role` assigned to an `account` address.
     * @dev Does NOT revert if `account` does not hold the role (allows pre-configuration).
     *
     * @custom:requirements Caller must have the admin role for `role`.
     *
     * @param role The role identifier.
     * @param account The address to set data for.
     * @param data The auxiliary data to store.
     *
     * @custom:events {RoleDataChanged} event.
     */
    function setRoleData(
        bytes32 role,
        address account,
        bytes calldata data
    ) external;

    /**
     * @notice Returns the auxiliary data stored for a role-address pair.
     * @param role The role identifier.
     * @param account The address to query data for.
     * @return The stored data, or empty bytes if none exists.
     */
    function getRoleData(
        bytes32 role,
        address account
    ) external view returns (bytes memory);
}
