// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _LSP8_INTERFACE_ID = 0x49399145;

// --- ERC725Y entries

// bytes8('LSP8MetadataAddress') + bytes4(0)
bytes12 constant _LSP8_METADATA_ADDRESS_KEY_PREFIX = 0x73dcc7c3c4096cdc00000000;

// bytes8('LSP8MetadataJSON') + bytes4(0)
bytes12 constant _LSP8_METADATA_JSON_KEY_PREFIX = 0x9a26b4060ae7f7d500000000;

// --- Token Hooks
bytes32 constant _LSP8TOKENSSENDER_TYPE_ID = 0x3724c94f0815e936299cca424da4140752198e0beb7931a6e0925d11bc97544c; // keccak256("LSP8TokensSender")

bytes32 constant _LSP8TOKENSRECIPIENT_TYPE_ID = 0xc7a120a42b6057a0cbed111fbbfbd52fcd96748c04394f77fc2c3adbe0391e01; // keccak256("LSP8TokensRecipient")
