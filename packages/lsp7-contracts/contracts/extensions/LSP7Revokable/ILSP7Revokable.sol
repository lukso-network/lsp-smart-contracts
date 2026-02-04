// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7Revokable
/// @dev Interface for LSP7 tokens that can be revoked by the owner or delegated revokers.
/// This extension allows the token issuer to revoke tokens from any holder back to themselves,
/// or burn tokens from any holder. Useful for memberships, role badges, compliance, and vesting scenarios.
interface ILSP7Revokable {
    /// @dev Emitted when an address is granted revoker rights.
    /// @param revoker The address that was granted revoker rights.
    event RevokerAdded(address indexed revoker);

    /// @dev Emitted when an address has its revoker rights removed.
    /// @param revoker The address that had its revoker rights removed.
    event RevokerRemoved(address indexed revoker);

    /// @notice Grants revoker rights to an address, allowing them to revoke and burn tokens from any holder.
    /// @dev Can only be called by the contract owner.
    /// @custom:events {RevokerAdded} event.
    /// @param revoker The address to grant revoker rights to.
    function addRevoker(address revoker) external;

    /// @notice Removes revoker rights from an address.
    /// @dev Can only be called by the contract owner.
    /// @custom:events {RevokerRemoved} event.
    /// @param revoker The address to remove revoker rights from.
    function removeRevoker(address revoker) external;

    /// @notice Checks if an address has revoker rights.
    /// @dev The contract owner is implicitly a revoker and does not need to be explicitly added.
    /// @param account The address to check.
    /// @return True if the address is the owner or has been granted revoker rights, false otherwise.
    function isRevoker(address account) external view returns (bool);

    /// @notice Get the number of addresses with delegated revoker rights (excluding the implicit owner).
    /// @return The number of delegated revokers.
    function getRevokersCount() external view returns (uint256);

    /// @notice Get the list of delegated revokers within a specified range.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses with delegated revoker rights.
    /// @custom:info To get all revokers, call `getRevokersCount()` to get the count and then
    /// call `getRevokersByIndex(0, count)`. Note: the owner is implicitly a revoker and not included in this list.
    function getRevokersByIndex(
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);

    /// @notice Revokes tokens from a holder and transfers them to the contract owner (token issuer).
    /// @dev Can only be called by the owner or a delegated revoker.
    /// The original token holder will be notified via LSP1 universalReceiver.
    /// @param from The address to revoke tokens from.
    /// @param amount The amount of tokens to revoke.
    /// @param data Additional data to include in the transfer notification.
    function revoke(address from, uint256 amount, bytes memory data) external;

    /// @notice Burns tokens from any holder without requiring their approval.
    /// @dev Can only be called by the owner or a delegated revoker.
    /// The original token holder will be notified via LSP1 universalReceiver.
    /// @param from The address to burn tokens from.
    /// @param amount The amount of tokens to burn.
    /// @param data Additional data to include in the burn notification.
    function revokeAndBurn(
        address from,
        uint256 amount,
        bytes memory data
    ) external;
}
