// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7RoleOperators
/// @dev Interface for managing role-based operators with associated data storage in an LSP7 token contract.
interface ILSP7RoleOperators {
    /// @dev Emitted when an address is added to or removed from a role.
    /// @param operator The operator address affected by the role change.
    /// @param role The role identifier affected by the change.
    /// @param added True if the operator was added, false if removed.
    event RoleOperatorChanged(
        address indexed operator,
        bytes32 indexed role,
        bool indexed added
    );

    /// @dev Emitted when role operator data is modified.
    /// @param role The role identifier for which data was changed.
    /// @param operator The operator address whose data was modified.
    /// @param data The new data stored for the operator in this role.
    event RoleOperatorDataChanged(
        bytes32 indexed role,
        address indexed operator,
        bytes data
    );

    /// @notice Authorizes an operator for a specific role with optional associated data.
    /// @dev Can only be called by the contract owner. If the operator is already authorized, only the data is updated (if non-empty).
    /// @custom:events {RoleOperatorChanged} event with added set to true (if newly added), and {RoleOperatorDataChanged} event if data is set or changed.
    /// @param role The role identifier to grant.
    /// @param operator The address to authorize as an operator for the role.
    /// @param data Arbitrary bytes data to associate with this role operator. Pass empty bytes to authorize without data.
    function authorizeRoleOperator(
        bytes32 role,
        address operator,
        bytes calldata data
    ) external;

    /// @notice Revokes an operator's authorization for a specific role.
    /// @dev Can be called by the contract owner or by the operator themselves (self-revocation). Also clears any associated data.
    /// @custom:events {RoleOperatorChanged} event with added set to false, and {RoleOperatorDataChanged} event if data was cleared.
    /// @param role The role identifier to revoke.
    /// @param operator The address to remove from the role.
    function revokeRoleOperator(bytes32 role, address operator) external;

    /// @notice Sets or updates data for an existing role operator.
    /// @dev Can only be called by the contract owner. Reverts if the operator is not already authorized for the role.
    /// @custom:events {RoleOperatorDataChanged} event with the new data.
    /// @custom:info This function requires the operator to already be authorized for the role. Use authorizeRoleOperator to authorize and set data atomically.
    /// @param role The role identifier.
    /// @param operator The operator address whose data to modify.
    /// @param data The new data to store for this role operator.
    function setRoleOperatorData(
        bytes32 role,
        address operator,
        bytes calldata data
    ) external;

    /// @notice Retrieves the data associated with a role operator.
    /// @dev Returns empty bytes if no data is stored for the operator.
    /// @param role The role identifier.
    /// @param operator The operator address to query.
    /// @return The stored data for the operator in this role, or empty bytes if none exists.
    function getRoleOperatorData(
        bytes32 role,
        address operator
    ) external view returns (bytes memory);

    /// @notice Checks if an address is authorized as an operator for a specific role.
    /// @param operator The address to check.
    /// @param role The role identifier to check.
    /// @return True if the address is authorized for the role, false otherwise.
    function hasRole(
        address operator,
        bytes32 role
    ) external view returns (bool);

    /// @notice Get the number of operators authorized for a specific role.
    /// @param role The role identifier to query.
    /// @return The number of operators authorized for the role.
    function getOperatorsCountForRole(
        bytes32 role
    ) external view returns (uint256);

    /// @notice Get the list of operators for a role within a specified range.
    /// @dev Used for pagination when enumerating all operators for a role.
    /// @custom:info To get all operators, call getOperatorsCountForRole() to get the total count, then call getRoleOperatorsByIndex(role, 0, count).
    /// @param role The role identifier to query.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of operator addresses in the specified range.
    function getRoleOperatorsByIndex(
        bytes32 role,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Get all roles assigned to a specific operator address.
    /// @param operator The operator address to query.
    /// @return An array of role identifiers assigned to the operator.
    function getRolesFor(
        address operator
    ) external view returns (bytes32[] memory);
}
