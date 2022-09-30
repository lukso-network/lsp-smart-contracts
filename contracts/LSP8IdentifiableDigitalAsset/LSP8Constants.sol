// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP8 = 0x49399145;

// --- ERC725Y Keys

// bytes10(keccak256('LSP8MetadataAddress')) + bytes2(0)
bytes12 constant _LSP8_METADATA_ADDRESS_KEY_PREFIX = 0x73dcc7c3c4096cdc7f8a0000;

// bytes10(keccak256('LSP8MetadataJSON')) + bytes2(0)
bytes12 constant _LSP8_METADATA_JSON_KEY_PREFIX = 0x9a26b4060ae7f7d5e3cd0000;

// --- Token Hooks

// bytes10(keccak256('LSP1UniversalReceiverDelegate')) + bytes2(0) + bytes20(keccak256('LSP8Tokens_SenderNotification'))
bytes32 constant _TYPEID_LSP8_TOKENSSENDER = 0x0cfc51aec37c55a4d0b10000b23eae7e6d1564b295b4c3e3be402d9a2f0776c5;

// bytes10(keccak256('LSP1UniversalReceiverDelegate')) + bytes2(0) + bytes20(keccak256('LSP8Tokens_SenderNotification'))
bytes32 constant _TYPEID_LSP8_TOKENSRECIPIENT = 0x0cfc51aec37c55a4d0b100000b084a55ebf70fd3c06fd755269dac2212c4d3f0;
