// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when a transfer would cause an address's balance to exceed the token balance cap.
error LSP7CappedBalanceExceeded(
    address to,
    uint256 tranferAmount,
    uint256 balanceOf,
    uint256 tokenBalanceCap
);
