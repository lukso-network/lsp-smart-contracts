// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when attempting to mint tokens after minting has been disabled.
error LSP8MintDisabled();

/// @dev Error thrown when attempting to disable minting when it is already disabled.
error LSP8MintingAlreadyDisabled();
