// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

//
// --- ERC725Y entries
//

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP8IdentifiableDigitalAsset'))
bytes32 constant _LSP8_SUPPORTED_STANDARDS_KEY =
  0xeafec4d89fa9619884b6b89135626455000000000000000000000000d9bfeb57;

// bytes4(keccak256('LSP8IdentifiableDigitalAsset'))
bytes4 constant _LSP8_SUPPORTED_STANDARDS_VALUE =
  0xd9bfeb57;

// bytes8('LSP8MetadataAddress') + bytes4(0)
bytes12 constant _LSP8_METADATA_ADDRESS_KEY_PREFIX = 0x73dcc7c3c4096cdc00000000;

// bytes8('LSP8MetadataJSON') + bytes4(0)
bytes12 constant _LSP8_METADATA_JSON_KEY_PREFIX = 0x9a26b4060ae7f7d500000000;

//
// --- ERC165 interface ids
//

bytes4 constant _LSP8_INTERFACE_ID = 0x49399145;
