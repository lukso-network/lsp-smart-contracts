// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- Type IDs

/**
 * bytes10(keccak256(LSP1UniversalReceiverDelegate)) +
 * bytes2(0) +
 * bytes20(keccak256(LSP14OwnershipTransferStarted))
 */
bytes32 constant LSP14OwnershipTransferStarted = 0x0cfc51aec37c55a4d0b10000ee9a7c0924f740a2ca33d59b7f0c2929821ea983;

/**
 * bytes10(keccak256(LSP1UniversalReceiverDelegate)) +
 * bytes2(0) +
 * bytes20(keccak256(LSP14OwnershipTransferred_SenderNotification))
 */
bytes32 constant LSP14OwnershipTransferred_SenderNotification = 0x0cfc51aec37c55a4d0b10000a124442e1cc7b52d8e2ede2787d43527dc1f3ae0;

/**
 * bytes10(keccak256(LSP1UniversalReceiverDelegate)) +
 * bytes2(0) +
 * bytes20(keccak256(LSP14OwnershipTransferred_RecipientNotification))
 */
bytes32 constant LSP14OwnershipTransferred_RecipientNotification = 0x0cfc51aec37c55a4d0b10000e32c7debcb817925ba4883fdbfc52797187f28f7;