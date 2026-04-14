// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7Revokable
/// @dev Interface for LSP7 tokens that can be revoked by addresses holding `REVOKER_ROLE`.
/// This extension allows authorized revokers to reclaim tokens from any holder back to the
/// contract owner or another authorized revoker.
interface ILSP7Revokable {
    /// @notice Returns whether the feature to revoke tokens from users is enabled or not.
    function isRevokable() external view returns (bool);

    /// @notice Revokes tokens from a holder and transfers them to `to`.
    /// @dev Can only be called by an address holding `REVOKER_ROLE`.
    /// The destination must be either the contract owner or an address holding `REVOKER_ROLE`.
    /// The original token holder will be notified via LSP1 universalReceiver.
    /// @param from The address to revoke tokens from.
    /// @param to The address receiving the revoked tokens.
    /// @param amount The amount of tokens to revoke.
    /// @param data Additional data to include in the transfer notification.
    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) external;
}
