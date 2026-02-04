// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when a transfer would cause an address's NFT count to exceed the token balance cap.
error LSP8CappedBalanceExceeded(address to, uint256 currentBalance, uint256 tokenBalanceCap);
