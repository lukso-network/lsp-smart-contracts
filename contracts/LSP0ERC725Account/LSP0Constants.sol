// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// >> INTERFACES

bytes4 constant _INTERFACE_ID_ERC725ACCOUNT = 0x63cb749b;

bytes4 constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;

// >> OTHER

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271MAGICVALUE = 0x1626ba7e;
bytes4 constant _ERC1271FAILVALUE = 0xffffffff;
