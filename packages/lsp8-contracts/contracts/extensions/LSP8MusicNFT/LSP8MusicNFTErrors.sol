// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Reverts when the bidirectional link between the LSP8 tokenId and the LSP7 contract is invalid.
/// @param lsp7Address The LSP7 address that was being linked.
/// @param tokenId The tokenId that was being linked.
error LSP33BidirectionalLinkMismatch(address lsp7Address, bytes32 tokenId);

/// @dev Reverts when caller is not the owner of the specified tokenId.
/// @param caller The address that attempted the call.
/// @param tokenId The tokenId being accessed.
/// @param tokenOwner The actual owner of the tokenId.
error LSP33NotTokenOwner(address caller, bytes32 tokenId, address tokenOwner);
