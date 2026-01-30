// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when querying the allowlist with an invalid index range.
/// @param startIndex The start index provided.
/// @param endIndex The end index provided.
/// @param length The current length of the allowlist.
error LSP8InvalidAllowlistIndexRange(
    uint256 startIndex,
    uint256 endIndex,
    uint256 length
);
