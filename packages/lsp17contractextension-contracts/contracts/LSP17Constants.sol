// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// --- ERC165 interface ids

// bytes4(keccack256("LSP17Extendable"))
bytes4 constant _INTERFACEID_LSP17_EXTENDABLE = 0xa918fa6b;

// bytes4(keccack256("LSP17Extension"))
bytes4 constant _INTERFACEID_LSP17_EXTENSION = 0xcee78b40;

// --- ERC725Y Data Keys

// Extension Handler Prefix

// bytes10(keccak256('LSP17Extension'))
bytes10 constant _LSP17_EXTENSION_PREFIX = 0xcee78b4094da86011096;
