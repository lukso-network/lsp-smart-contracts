// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Reverts when trying to transfer or renounce ownership while LSP34 external ownership is active.
error LSP34ExternalOwnershipActive();

/// @dev Reverts when an unauthorized address tries to set data.
/// @param caller The address that attempted the operation.
error LSP7MusicNFTUnauthorized(address caller);
