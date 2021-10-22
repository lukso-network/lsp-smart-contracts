// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

//
// --- ERC725Y entries
//

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP7DigitalAsset'))
bytes32 constant _LSP7_SUPPORTED_STANDARDS_KEY =
  0xeafec4d89fa9619884b6b8913562645500000000000000000000000074ac49b0;

// bytes4(keccak256('LSP7DigitalAsset'))
bytes4 constant _LSP7_SUPPORTED_STANDARDS_VALUE =
  0x74ac49b0;

//
// --- ERC165 interface ids
//

// TODO: do we need to define these for LSP7/8?
