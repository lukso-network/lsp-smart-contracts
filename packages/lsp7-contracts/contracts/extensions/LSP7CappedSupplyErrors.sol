// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

/**
 * @notice The `tokenSupplyCap` must be set and cannot be `0`.
 * @dev Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.
 */
error LSP7CappedSupplyRequired();

/**
 * @notice Cannot mint anymore as total supply reached the maximum cap.
 * @dev Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.
 */
error LSP7CappedSupplyCannotMintOverCap();
