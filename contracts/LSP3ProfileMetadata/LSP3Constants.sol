// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP3Profile'))
bytes32 constant _LSP3_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347;

// bytes4(keccak256('LSP3UniversalProfile'))
bytes constant _LSP3_SUPPORTED_STANDARDS_VALUE = hex"5ef83ad9";

// bytes32(keccak256("LSP3Profile"))
bytes32 constant _LSP3_PROFILE_KEY = 0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5;
