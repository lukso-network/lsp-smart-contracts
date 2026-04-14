// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8Revokable
/// @dev Interface for LSP8 tokens that can be revoked by addresses holding `REVOKER_ROLE`.
/// This extension allows authorized revokers to reclaim NFTs from any holder back to the
/// contract owner or another authorized revoker.
interface ILSP8Revokable {
    /// @notice Returns whether the feature to revoke tokens from users is enabled or not.
    function isRevokable() external view returns (bool);

    /// @notice Revokes `tokenId` from a holder and transfers it to `to`.
    /// @dev Can only be called by an address holding `REVOKER_ROLE`.
    /// The destination must be either the contract owner or an address holding `REVOKER_ROLE`.
    /// The original token holder will be notified via LSP1 universalReceiver.
    /// @param from The address to revoke the token from.
    /// @param to The address receiving the revoked token.
    /// @param tokenId The tokenId to revoke.
    /// @param data Additional data to include in the transfer notification.
    function revoke(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) external;
}
