// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP0 = 0xcf6e8efc;
bytes4 constant _INTERFACEID_ERC1271 = 0x1626ba7e;

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271_MAGICVALUE = 0x1626ba7e;
bytes4 constant _ERC1271_FAILVALUE = 0xffffffff;

// Extension Handler Prefix

// bytes10(keccak256('ExtensionHandler'))
bytes10 constant _LSP0_EXTENSION_HANDLER_PREFIX = 0x21c768241ee86a8d564b;
