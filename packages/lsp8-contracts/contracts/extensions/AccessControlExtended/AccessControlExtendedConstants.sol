// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @dev ERC-165 interface ID for IAccessControl from OpenZeppelin.
bytes4 constant _INTERFACEID_ACCESSCONTROL = 0x7965db0b;

/// @dev ERC-165 interface ID for IAccessControlEnumerable from OpenZeppelin.
bytes4 constant _INTERFACEID_ACCESSCONTROLENUMERABLE = 0x5a05180f;

/// @dev ERC-165 interface ID for IAccessControlExtended.
/// Computed as XOR of selectors:
/// getRoleMembers(bytes32) ^ rolesOf(address) ^ setRoleAdmin(bytes32,bytes32) ^ getRoleAdmin(bytes32)
bytes4 constant _INTERFACEID_ACCESSCONTROLEXTENDED = 0xb409bee6;
