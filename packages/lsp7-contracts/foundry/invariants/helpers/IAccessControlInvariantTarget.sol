// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @dev Minimal surface for AccessControlExtended invariants (8–11).
interface IAccessControlInvariantTarget {
    function owner() external view returns (address);

    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    function hasRole(bytes32 role, address account) external view returns (bool);

    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    function rolesOf(address account) external view returns (bytes32[] memory);

    function getRoleMemberCount(bytes32 role) external view returns (uint256);

    function getRoleMembers(bytes32 role) external view returns (address[] memory);
}
