// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/// @title ILSP7CappedSupply
/// @dev Interface for an LSP7 token extension that enforces a max token supply cap.
interface ILSP7CappedSupply {
    /// @notice The maximum supply amount of tokens allowed to exist is `_TOKEN_SUPPLY_CAP`.
    /// @dev Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches {totalSupplyCap}, it is not possible to mint more tokens.
    /// @return The maximum number of tokens that can exist in the contract.
    function tokenSupplyCap() external view returns (uint256);
}
