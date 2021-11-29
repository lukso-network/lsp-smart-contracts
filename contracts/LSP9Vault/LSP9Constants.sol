// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _LSP9_INTERFACE_ID = 0x75edcee5;

// --- ERC725Y entries

// --- Token Hooks
bytes32 constant _LSP9_VAULT_SENDER_TYPE_ID_ = 0x3ca9f769340018257ac15b3a00e502e8fb730d66086f774210f84d0205af31e7; // keccak256("LSP9VaultSender")

bytes32 constant _LSP9_VAULT_RECEPIENT_TYPE_ID_ = 0x9ad7159ca6f92187cd71eeac672b7c7fd101b9020ee51ba743c84a117d9b3a6f; // keccak256("LSP9VaultReceiver")
