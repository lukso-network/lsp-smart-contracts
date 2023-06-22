// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";

// constants
import {_PERMISSION_CHANGEOWNER} from "../LSP6Constants.sol";

// errors
import {NotAuthorised} from "../LSP6Errors.sol";

abstract contract LSP6OwnershipModule {
    function _verifyOwnershipPermissions(
        address controllerAddress,
        bytes32 controllerPermissions
    ) internal pure {
        if (
            !LSP6Utils.hasPermission(
                controllerPermissions,
                _PERMISSION_CHANGEOWNER
            )
        ) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                _PERMISSION_CHANGEOWNER
            );
            revert NotAuthorised(controllerAddress, permissionErrorString);
        }
    }
}
