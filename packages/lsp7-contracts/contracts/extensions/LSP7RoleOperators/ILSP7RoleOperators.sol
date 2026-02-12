// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7RoleOperators
/// @dev Interface for managing role-based operators with associated data storage in an LSP7 token contract.
interface ILSP7RoleOperators {
    /// @dev Emitted when an address is added to or removed from a role.
    /// @param role The role identifier affected by the change.
    /// @param _address The address affected by the role change.
    /// @param added True if the address was added, false if removed.
    event RoleOperatorChanged(
        bytes32 indexed role,
        address indexed _address,
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

    /// @notice Authorizes an operator for a specific role without associated data.
    /// @dev Can only be called by the contract owner. Sets empty bytes data for the operator.
    /// @custom:events {RoleOperatorChanged} event with added set to true.
    /// @param role The role identifier to grant.
    /// @param _address The address to authorize as an operator for the role.
    function authorizeRoleOperator(bytes32 role, address _address) external;

    /// @notice Authorizes an operator for a specific role with associated data in a single transaction.
    /// @dev Can only be called by the contract owner. If the operator is already authorized, this updates their data.
    /// @custom:events {RoleOperatorChanged} event with added set to true (if newly added), and {RoleOperatorDataChanged} event if data is set.
    /// @param role The role identifier to grant.
    /// @param operator The address to authorize as an operator for the role.
    /// @param data Arbitrary bytes data to associate with this role operator.
    function authorizeRoleOperatorWithData(
        bytes32 role,
        address operator,
        bytes calldata data
    ) external;

    /// @notice Revokes an operator's authorization for a specific role.
    /// @dev Can only be called by the contract owner. Also clears any associated data.
    /// @custom:events {RoleOperatorChanged} event with added set to false, and {RoleOperatorDataChanged} event if data was cleared.
    /// @param role The role identifier to revoke.
    /// @param _address The address to remove from the role.
    function revokeRoleOperator(bytes32 role, address _address) external;

    /// @notice Sets or updates data for an existing role operator.
    /// @dev Can only be called by the contract owner. Reverts if the operator is not already authorized for the role.
    /// @custom:events {RoleOperatorDataChanged} event with the new data.
    /// @custom:info This function requires the operator to already be authorized for the role. Use authorizeRoleOperatorWithData to authorize and set data atomically.
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
    /// @param role The role identifier to check.
    /// @param _address The address to check.
    /// @return True if the address is authorized for the role, false otherwise.
    function isRoleOperator(
        bytes32 role,
        address _address
    ) external view returns (bool);

    /// @notice Get the number of operators authorized for a specific role.
    /// @param role The role identifier to query.
    /// @return The number of operators authorized for the role.
    function getRoleOperatorsLength(
        bytes32 role
    ) external view returns (uint256);

    /// @notice Get the list of operators for a role within a specified range.
    /// @dev Used for pagination when enumerating all operators for a role.
    /// @custom:info To get all operators, call getRoleOperatorsLength() to get the total count, then call getRoleOperatorsByIndex(role, 0, count).
    /// @param role The role identifier to query.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of operator addresses in the specified range.
    function getRoleOperatorsByIndex(
        bytes32 role,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Authorizes multiple operators for a role with associated data in a single transaction.
    /// @dev Can only be called by the contract owner. The operators and data arrays must have the same length.
    /// @param role The role to authorize operators for.
    /// @param operators The addresses to authorize as role operators.
    /// @param dataArray The data to associate with each operator (must match operators array length).
    /// @custom:events Emits {RoleOperatorChanged} for each newly added operator.
    /// @custom:events Emits {RoleOperatorDataChanged} for each operator where data is set or changed.
    function authorizeRoleOperatorBatch(
        bytes32 role,
        address[] calldata operators,
        bytes[] calldata dataArray
    ) external;

    /// @notice Revokes multiple operators from a role in a single transaction.
    /// @dev Can only be called by the contract owner. Cannot revoke reserved addresses (address(0), dead address).
    /// @param role The role to revoke operators from.
    /// @param operators The addresses to revoke from the role.
    /// @custom:events Emits {RoleOperatorChanged} for each removed operator.
    /// @custom:events Emits {RoleOperatorDataChanged} for each operator that had associated data.
    function revokeRoleOperatorBatch(
        bytes32 role,
        address[] calldata operators
    ) external;
}
