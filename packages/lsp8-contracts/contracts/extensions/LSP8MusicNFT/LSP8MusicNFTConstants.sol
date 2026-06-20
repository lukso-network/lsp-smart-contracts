// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP33MusicNFT'))
bytes32 constant _LSP33_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b60000f43ae543d533ae7389b5791d7870aadfdcff2ca4;

// bytes4(keccak256('LSP33MusicNFT'))
bytes constant _LSP33_SUPPORTED_STANDARDS_VALUE = hex"3cd46617";

// keccak256('LSP33Metadata')
bytes32 constant _LSP33_METADATA_KEY = 0xbecee5b67fa43fb2e96c7c6ccdc23007fffc2b24205416b2122cd7b8d8ef48fa;
