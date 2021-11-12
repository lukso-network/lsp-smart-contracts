// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _LSP8_INTERFACE_ID = 0x49399145;

// --- ERC725Y entries

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP8IdentifiableDigitalAsset'))
bytes32 constant _LSP8_SUPPORTED_STANDARDS_KEY =
  0xeafec4d89fa9619884b6b891356264550000000000000000000000006a3c8618;

// bytes4(keccak256('LSP8IdentifiableDigitalAsset'))
bytes4 constant _LSP8_SUPPORTED_STANDARDS_VALUE = 0x6a3c8618;

// bytes8('LSP8MetadataAddress') + bytes4(0)
bytes12 constant _LSP8_METADATA_ADDRESS_KEY_PREFIX = 0x73dcc7c3c4096cdc00000000;

// bytes8('LSP8MetadataJSON') + bytes4(0)
bytes12 constant _LSP8_METADATA_JSON_KEY_PREFIX = 0x9a26b4060ae7f7d500000000;

// --- Token Hooks
bytes32 constant _LSP8TOKENSSENDER_TYPE_ID =
    0x3724c94f0815e936299cca424da4140752198e0beb7931a6e0925d11bc97544c; // keccak256("LSP8TokensSender")

bytes32 constant _LSP8TOKENSRECIPIENT_TYPE_ID =
    0xc7a120a42b6057a0cbed111fbbfbd52fcd96748c04394f77fc2c3adbe0391e01; // keccak256("LSP8TokensRecipient")
