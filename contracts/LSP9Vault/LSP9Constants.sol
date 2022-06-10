// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP9 = 0x8c1d44f6;

// --- ERC725Y Keys

// bytes10(keccak256('SupportedStandard')) + bytes2(0) + bytes20(keccak256('LSP9Vault'))
bytes32 constant _LSP9_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90;

// bytes4(keccak256('LSP9Vault'))
bytes constant _LSP9_SUPPORTED_STANDARDS_VALUE = hex"7c0334a1";

// --- Vault Hooks

// keccak256("LSP9VaultSender")
bytes32 constant _TYPEID_LSP9_VAULTSENDER = 0x3ca9f769340018257ac15b3a00e502e8fb730d66086f774210f84d0205af31e7;

// keccak256("LSP9VaultRecipient")
bytes32 constant _TYPEID_LSP9_VAULTRECIPIENT = 0x09aaf55960715d8d86b57af40be36b0bfd469c9a3643445d8c65d39e27b4c56f;
