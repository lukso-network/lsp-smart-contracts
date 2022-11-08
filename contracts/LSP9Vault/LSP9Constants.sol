// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP9 = 0xd9483482;

// --- ERC725Y Keys

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP9Vault'))
bytes32 constant _LSP9_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90;

// bytes4(keccak256('LSP9Vault'))
bytes constant _LSP9_SUPPORTED_STANDARDS_VALUE = hex"7c0334a1";
