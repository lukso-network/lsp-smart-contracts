// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Reverts when an address that is neither the contract's ERC173 `owner()`
/// nor the address resolved via `LSP34OwnershipSource` attempts to call `mint()`.
/// @param caller The address that attempted the mint call.
error LSP34NotAuthorizedToMint(address caller);
