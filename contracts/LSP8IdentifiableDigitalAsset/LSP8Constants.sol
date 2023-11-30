// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP8 = 0xecad9f75;

// --- ERC725Y Data Keys

// keccak256('LSP8TokenIdSchema')
bytes32 constant _LSP8_TOKENID_SCHEMA_KEY = 0x341bc44e55234544c70af9d37b2cb8cc7ba74685b58526221de2cc977f469924;

// keccak256('LSP8TokenMetadataBaseURI')
bytes32 constant _LSP8_TOKEN_METADATA_BASE_URI = 0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843;

// keccak256('LSP8ReferenceContract')
bytes32 constant _LSP8_REFERENCE_CONTRACT = 0x708e7b881795f2e6b6c2752108c177ec89248458de3bf69d0d43480b3e5034e6;

// --- Token Hooks

// keccak256('LSP8Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP8_TOKENSSENDER = 0xb23eae7e6d1564b295b4c3e3be402d9a2f0776c57bdf365903496f6fa481ab00;

// keccak256('LSP8Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP8_TOKENSRECIPIENT = 0x0b084a55ebf70fd3c06fd755269dac2212c4d3f0f4d09079780bfa50c1b2984d;

// keccak256('LSP8Tokens_OperatorNotification')
bytes32 constant _TYPEID_LSP8_TOKENOPERATOR = 0x8a1c15a8799f71b547e08e2bcb2e85257e81b0a07eee2ce6712549eef1f00970;

// --- Token IDs Schema

uint256 constant _LSP8_TOKENID_SCHEMA_NUMBER = 0;
uint256 constant _LSP8_TOKENID_SCHEMA_STRING = 1;
uint256 constant _LSP8_TOKENID_SCHEMA_ADDRESS = 2;
uint256 constant _LSP8_TOKENID_SCHEMA_UNIQUE_ID = 3;
uint256 constant _LSP8_TOKENID_SCHEMA_HASH = 4;

uint256 constant _LSP8_TOKENID_SCHEMA_MIXED_DEFAULT_NUMBER = 100;
uint256 constant _LSP8_TOKENID_SCHEMA_MIXED_DEFAULT_STRING = 101;
uint256 constant _LSP8_TOKENID_SCHEMA_MIXED_DEFAULT_ADDRESS = 102;
uint256 constant _LSP8_TOKENID_SCHEMA_MIXED_DEFAULT_UNIQUE_ID = 103;
uint256 constant _LSP8_TOKENID_SCHEMA_MIXED_DEFAULT_HASH = 104;
