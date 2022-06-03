// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// bytes10(keccak256('SupportedStandard')) + bytes2(0) + bytes20(keccak256('LSP3UniversalProfile'))
bytes32 constant _LSP3_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38;

// bytes4(keccak256('LSP3UniversalProfile'))
bytes constant _LSP3_SUPPORTED_STANDARDS_VALUE = hex"abe425d6";

// bytes32(keccak256("LSP3Profile"))
bytes32 constant _LSP3_PROFILE_KEY = 0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5;
