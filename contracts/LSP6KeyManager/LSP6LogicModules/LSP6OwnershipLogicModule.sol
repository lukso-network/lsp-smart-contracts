// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";

// constants
import {_PERMISSION_CHANGEOWNER} from "../LSP6Constants.sol";

abstract contract LSP6OwnershipLogicModule {
    function _verifyOwnershipPermissions(address controllerAddress, bytes32 controllerPermissions)
        internal
        pure
    {
        LSP6Utils.requirePermissions(
            controllerAddress,
            controllerPermissions,
            _PERMISSION_CHANGEOWNER
        );
    }
}
