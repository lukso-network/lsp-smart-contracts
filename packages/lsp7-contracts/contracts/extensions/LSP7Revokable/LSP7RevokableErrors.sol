// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @notice Reverts when an address that is not the owner or a delegated revoker attempts to revoke or burn tokens.
/// @param caller The address that attempted the unauthorized action.
error LSP7NotAuthorizedRevoker(address caller);

/// @notice Reverts when an invalid index range is provided when querying revokers.
/// @param startIndex The start index provided.
/// @param endIndex The end index provided.
/// @param revokersCount The total number of revokers.
error LSP7InvalidRevokerIndexRange(
    uint256 startIndex,
    uint256 endIndex,
    uint256 revokersCount
);
