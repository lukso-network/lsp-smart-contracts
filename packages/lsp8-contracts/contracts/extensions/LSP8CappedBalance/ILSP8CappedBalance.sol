// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8CappedBalance
/// @dev Interface for an LSP8 token extension that enforces a per-address NFT count cap, with exemptions for allowlisted addresses.
interface ILSP8CappedBalance {
    /// @notice Retrieves the maximum number of NFTs allowed per address.
    /// @dev Returns the immutable balance cap set during contract deployment.
    /// @return The maximum number of NFTs allowed for any single address.
    function tokenBalanceCap() external view returns (uint256);
}
