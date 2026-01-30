// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP7CappedBalance
/// @dev Interface for an LSP7 token extension that enforces a per-address balance cap, with exemptions for allowlisted addresses.
interface ILSP7CappedBalance {
    /// @notice Retrieves the maximum token balance allowed per address.
    /// @dev Returns the immutable balance cap set during contract deployment.
    /// @return The maximum token balance allowed for any single address.
    function tokenBalanceCap() external view returns (uint256);
}
