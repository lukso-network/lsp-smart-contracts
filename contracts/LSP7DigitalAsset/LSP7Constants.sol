// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7 = 0x5fcaac27;

// --- Token Hooks

// bytes10(keccak256('LSP1UniversalReceiverDelegate')) + bytes2(0) + bytes20(keccak256('LSP7Tokens_SenderNotification'))
bytes32 constant _TYPEID_LSP7_TOKENSSENDER = 0x0cfc51aec37c55a4d0b10000429ac7a06903dbc9c13dfcb3c9d11df8194581fa;

// bytes10(keccak256('LSP1UniversalReceiverDelegate')) + bytes2(0) + bytes20(keccak256('LSP7Tokens_RecipientNotification'))
bytes32 constant _TYPEID_LSP7_TOKENSRECIPIENT = 0x0cfc51aec37c55a4d0b1000020804611b3e2ea21c480dc465142210acf4a2485;
