// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7 = 0xdaa746b7;

// --- Token Hooks

// keccak256('LSP7Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP7_TOKENSSENDER = 0x429ac7a06903dbc9c13dfcb3c9d11df8194581fa047c96d7a4171fc7402958ea;

// keccak256('LSP7Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP7_TOKENSRECIPIENT = 0x20804611b3e2ea21c480dc465142210acf4a2485947541770ec1fb87dee4a55c;

// keccak256('LSP7Tokens_OperatorNotification')
bytes32 constant _TYPEID_LSP7_TOKENOPERATOR = 0x386072cc5a58e61263b434c722725f21031cd06e7c552cfaa06db5de8a320dbc;
