// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../LSP6KeyManager/LSP6Utils.sol";

contract LSP6UtilsFuzzing {
    bool public has0PermissionBool = false;
    bool public hasAllPermissionBool = true;

    //check when addressPermission is 0
    function has0Permission(bytes32 permissionToCheck) external {
        bytes32 addressPermission = bytes32(0);
        //since we are using addressPermission = bytes32(0) this should always return false
        if (LSP6Utils.hasPermission(addressPermission, permissionToCheck)) {
            has0PermissionBool = true;
        }
    }

    function hasAllPermission(bytes32 permissionToCheck) external {
        bytes32 addressPermission = bytes32(
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        );
        //since we are using addressPermission = bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) this should always return true
        if (!LSP6Utils.hasPermission(addressPermission, permissionToCheck)) {
            hasAllPermissionBool = false;
        }
    }

    function echidna_has0Permission() external view returns (bool) {
        return !has0PermissionBool;
    }

    function echidna_hasAllPermission() external view returns (bool) {
        return hasAllPermissionBool;
    }
}
