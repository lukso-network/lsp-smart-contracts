// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

//
// --- ERC725Y entries
//

// bytes16(keccak256('SupportedStandard')) + bytes12(0) + bytes4(keccak256('LSP8IdentifiableDigitalCertificate'))
bytes32 constant _LSP8_SUPPORTED_STANDARDS_KEY =
  0xeafec4d89fa9619884b6b89135626455000000000000000000000000d9bfeb57;

// bytes4(keccak256('LSP8IdentifiableDigitalCertificate'))
bytes4 constant _LSP8_SUPPORTED_STANDARDS_VALUE =
  0xd9bfeb57;


//
// --- ERC165 interface ids
//

// TODO: do we need to define these for LSP7/8?
