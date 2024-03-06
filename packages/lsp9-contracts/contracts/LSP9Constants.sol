// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP9 = 0x28af17e6;

// --- ERC725Y Data Keys

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP9Vault'))
bytes32 constant _LSP9_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90;

// bytes4(keccak256('LSP9Vault'))
bytes constant _LSP9_SUPPORTED_STANDARDS_VALUE = hex"7c0334a1";

// --- Native Token Type Id

// keccak256('LSP9ValueReceived')
bytes32 constant _TYPEID_LSP9_VALUE_RECEIVED = 0x468cd1581d7bc001c3b685513d2b929b55437be34700410383d58f3aa1ea0abc;

// Ownership Transfer Type IDs

// keccak256('LSP9OwnershipTransferStarted')
bytes32 constant _TYPEID_LSP9_OwnershipTransferStarted = 0xaefd43f45fed1bcd8992f23c803b6f4ec45cf6b62b0d404d565f290a471e763f;

// keccak256('LSP9OwnershipTransferred_SenderNotification')
bytes32 constant _TYPEID_LSP9_OwnershipTransferred_SenderNotification = 0x0c622e58e6b7089ae35f1af1c86d997be92fcdd8c9509652022d41aa65169471;

// keccak256('LSP9OwnershipTransferred_RecipientNotification')
bytes32 constant _TYPEID_LSP9_OwnershipTransferred_RecipientNotification = 0x79855c97dbc259ce395421d933d7bc0699b0f1561f988f09a9e8633fd542fe5c;
