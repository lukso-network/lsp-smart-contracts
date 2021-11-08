// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _LSP7_INTERFACE_ID = 0xe33f65c3;

// --- ERC725Y entries

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP7DigitalAsset'))
bytes32 constant _LSP7_SUPPORTED_STANDARDS_KEY =
  0xeafec4d89fa9619884b6b8913562645500000000000000000000000074ac49b0;

// bytes4(keccak256('LSP7DigitalAsset'))
bytes4 constant _LSP7_SUPPORTED_STANDARDS_VALUE = 0x74ac49b0;

// --- Token Hooks
bytes32 constant _LSP7TOKENSSENDER_TYPE_ID =
    0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9; // keccak256("LSP7TokensSender")

bytes32 constant _LSP7TOKENSRECIPIENT_TYPE_ID =
    0xdbe2c314e1aee2970c72666f2ebe8933a8575263ea71e5ff6a9178e95d47a26f; // keccak256("LSP7TokensRecipient")
