// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

// keccak256('LSP7NonTransferable')
bytes32 constant _LSP7_NON_TRANSFERABLE = 0xb48a0085fb2c841c614d8c650033c5b790f407c071b9176ca4f2003db3613a1f;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7 = 0xda1f85e4;

// --- Token Hooks

// keccak256('LSP7Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP7_TOKENSSENDER = 0x429ac7a06903dbc9c13dfcb3c9d11df8194581fa047c96d7a4171fc7402958ea;

// keccak256('LSP7Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP7_TOKENSRECIPIENT = 0x20804611b3e2ea21c480dc465142210acf4a2485947541770ec1fb87dee4a55c;
