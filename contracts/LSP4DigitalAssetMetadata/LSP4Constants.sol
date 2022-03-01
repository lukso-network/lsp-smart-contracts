// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC725Y entries

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP4DigitalAsset'))
bytes32 constant _LSP4_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624;

// bytes4(keccak256('LSP4DigitalAsset'))
bytes constant _LSP4_SUPPORTED_STANDARDS_VALUE = hex"a4d96624";

// keccak256('LSP4TokenName')
bytes32 constant _LSP4_TOKEN_NAME_KEY = 0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1;

// keccak256('LSP4TokenSymbol')
bytes32 constant _LSP4_TOKEN_SYMBOL_KEY = 0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756;

// keccak256('LSP4Creators[]')
bytes32 constant _LSP4_CREATORS_ARRAY_KEY = 0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7;

// bytes8(keccak256('LSP4CreatorsMap')) + bytes4(0)
bytes12 constant _LSP4_CREATORS_MAP_KEY_PREFIX = 0x6de85eaf5d982b4e00000000;

// keccak256('LSP4Metadata')
bytes32 constant _LSP4_METADATA_KEY = 0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e;
