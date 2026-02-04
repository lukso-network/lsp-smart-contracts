// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when querying the allowlist with an invalid index range.
/// @param startIndex The start index provided.
/// @param endIndex The end index provided.
/// @param length The current length of the allowlist.
error LSP7AllowListInvalidIndexRange(
    uint256 startIndex,
    uint256 endIndex,
    uint256 length
);

/// @dev Error thrown when attempting to remove a reserved address from the allowlist.
/// @param reservedAddress The address that cannot be removed (e.g., address(0) or dead address).
error LSP7AllowListCannotRemoveReservedAddress(address reservedAddress);
