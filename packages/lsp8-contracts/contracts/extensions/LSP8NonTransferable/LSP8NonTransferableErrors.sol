// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev Error thrown when attempting a token transfer while transfers are disabled.
error LSP8TransferDisabled();

/// @dev Error thrown when the transfer lock period is invalid, such as when the end timestamp is earlier than the start timestamp.
error LSP8InvalidTransferLockPeriod();

/// @dev Error thrown when attempting to update the transfer lock period after it has begun.
error LSP8CannotUpdateTransferLockPeriod();
