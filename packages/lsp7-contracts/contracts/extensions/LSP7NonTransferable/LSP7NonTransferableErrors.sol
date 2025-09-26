// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/// @dev Error thrown when attempting a token transfer while transfers are disabled.
error LSP7TransferDisabled();

/// @dev Error thrown when the transfer lock period is invalid, such as when the end timestamp is earlier than the start timestamp.
error LSP7InvalidTransferLockPeriod();

/// @dev Error thrown when attempting to update the transfer lock period after it has begun.
error LSP7CannotUpdateTransferLockPeriod();
