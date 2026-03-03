// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// interfaces
import {
    IAccessControlExtended
} from "./IAccessControlExtended.sol";

/// @dev ERC-165 interface ID for IAccessControlExtended.
bytes4 constant _INTERFACEID_ACCESSCONTROLEXTENDED = type(IAccessControlExtended).interfaceId;
