// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// keccak256("Minter")
bytes32 constant _MINT_ROLE = 0x6e58ad548d72b425ea94c15f453bf26caddb061d82b2551db7fdd3cefe0e9940;

// keccak256("NonTransferableBypass")
bytes32 constant _ALLOW_TRANSFER_ROLE = 0x9f54f5e43b3729d673163516dd0a0f168af177accb60dfd1e505c75807b918f7;

// keccak256("UncappedBalance")
bytes32 constant _INFINITE_BALANCE_ROLE = 0x2b4347b9a07b4933b0e6817adfd4c0afe06ebc87ef5f1c8f6dad64c11a285a50;

// The dead address is also commonly used for burning tokens as an alternative to address(0).
address constant _DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

// keccak256("LSP7Tokens_RoleOperatorNotification")
bytes32 constant _TYPEID_LSP7_ROLE_OPERATOR = 0x737565efb5e19e8b0cf2af36b69f62c39a16d45500f048951e146af780ad1e5f;
