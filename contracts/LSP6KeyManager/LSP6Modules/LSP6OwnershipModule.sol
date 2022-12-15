// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";

// errors
import "../LSP6Errors.sol";

//constants
import "../LSP6Constants.sol";

abstract contract LSP6OwnershipModule {
    using LSP6Utils for *;

    function verifyOwnershipPermissions(
        address from,
        bytes32 permissions,
        bytes calldata,
        address
    ) external pure {
        _requirePermissions(from, permissions, _PERMISSION_CHANGEOWNER);
    }

    /**
     * @dev revert if `from`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param from the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address from,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = permissionRequired.getPermissionName();
            revert NotAuthorised(from, permissionErrorString);
        }
    }
}
