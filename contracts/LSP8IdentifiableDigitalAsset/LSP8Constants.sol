// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP8 = 0x30dc5278;

// --- ERC725Y Data Keys

// keccak256('LSP8TokenIdType')
bytes32 constant _LSP8_TOKENID_TYPE_KEY = 0x715f248956de7ce65e94d9d836bfead479f7e70d69b718d47bfe7b00e05b4fe4;

// bytes10(keccak256('LSP8MetadataTokenURI')) + bytes2(0)
bytes12 constant _LSP8_METADATA_TOKEN_URI_PREFIX = 0x1339e76a390b7b9ec9010000;

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

// --- Types of token IDs

uint256 constant _LSP8_TOKENID_TYPE_NUMBER = 0;
uint256 constant _LSP8_TOKENID_TYPE_STRING = 1;
uint256 constant _LSP8_TOKENID_TYPE_UNIQUE_ID = 2;
uint256 constant _LSP8_TOKENID_TYPE_HASH = 3;
uint256 constant _LSP8_TOKENID_TYPE_ADDRESS = 4;
