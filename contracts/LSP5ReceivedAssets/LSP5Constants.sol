// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// --- ERC725Y Keys

// keccak256('LSP5ReceivedAssets[]')
bytes32 constant _LSP5_RECEIVED_ASSETS_ARRAY_KEY = 0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b;

// bytes10(keccak256('LSP5ReceivedAssetsMap')) + bytes2(0)
bytes12 constant _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX = 0x812c4334633eb816c80d0000;
