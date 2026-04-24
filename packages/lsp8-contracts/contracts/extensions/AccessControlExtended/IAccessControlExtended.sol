// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// interfaces
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

/**
 * @title IAccessControlExtended
 *
 * @dev Interface extending IAccessControlEnumerable with reverse role lookups and function to set admin role for a given role.
 * Inherits all functions from {IAccessControl} and {IAccessControlEnumerable}.
 *
 * @custom:info This interface only include the setter function `setRoleAdmin(bytes32,bytes32)`. The getter `getRoleAdmin(bytes32)` is inherited from {IAccessControl}
 * (itself inherited through {IAccessControlEnumerable}). This ensures that the selector `getRoleAdmin(bytes32)` is not used twice to calculate the final interface Id.
 */
interface IAccessControlExtended is IAccessControlEnumerable {
    /**
     * @notice Sets a new admin role for `role`.
     * @param role The role identifier being configured.
     * @param adminRole The role that will become the new admin of `role`.
     */
    function setRoleAdmin(bytes32 role, bytes32 adminRole) external;

    /**
     * @notice Returns all members that hold `role`.
     *
     * @dev Convenience function that returns the full membership array in a single call.
     * Equivalent to calling {getRoleMember} for each index from `0` to `getRoleMemberCount(role) - 1`.
     *
     * @param role The role identifier to query members for.
     * @return An array of addresses that currently hold the specified role.
     *
     * @custom:warning This function copies the entire role membership set into memory.
     * For roles with a large number of members, this may consume a significant amount of gas. If calling this function on-chain,
     * consider calling `{getRoleMember}` repeatedly, using `getRoleMemberCount` to know as max index.
     * This function is primarily intended for off-chain usage.
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
}
