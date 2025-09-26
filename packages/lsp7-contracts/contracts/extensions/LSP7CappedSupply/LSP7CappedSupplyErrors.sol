// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

/// @notice Cannot mint anymore as total supply reached the maximum cap.
/// @dev Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.
error LSP7CappedSupplyCannotMintOverCap();
