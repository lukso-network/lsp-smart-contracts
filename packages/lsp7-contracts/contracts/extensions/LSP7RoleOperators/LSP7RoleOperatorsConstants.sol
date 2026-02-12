// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// keccak256("Mint")
bytes32 constant _MINT_ROLE = 0x234e55c1cd55f1338241b50d352f0e91c7e4ffad0e4271d64eb347589ebdfd16;

// keccak256("AllowTransfer")
bytes32 constant _ALLOW_TRANSFER_ROLE = 0x1a1361fa28e52f174f39cc6abdde2329a42871c5d56ebe98ef279dbf801f2cc9;

// keccak256("InfiniteBalance")
bytes32 constant _INFINITE_BALANCE_ROLE = 0x1137963b95925bf5438de9068d3b310906703f0e3037a42f3abf9c7af516ffd9;

// The dead address is also commonly used for burning tokens as an alternative to address(0).
address constant _DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
address constant _ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
