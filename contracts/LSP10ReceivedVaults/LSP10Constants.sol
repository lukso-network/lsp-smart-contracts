// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// --- ERC725Y Keys

// keccak256('LSP10Vaults[]')
bytes32 constant _LSP10_VAULTS_ARRAY_KEY = 0x55482936e01da86729a45d2b87a6b1d3bc582bea0ec00e38bdb340e3af6f9f06;

// bytes10(keccak256('LSP10VaultsMap')) + bytes2(0)
bytes12 constant _LSP10_VAULTS_MAP_KEY_PREFIX = 0x192448c3c0f88c7f238c0000;
