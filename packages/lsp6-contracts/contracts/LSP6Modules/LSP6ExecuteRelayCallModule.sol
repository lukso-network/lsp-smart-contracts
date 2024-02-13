// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";

// constants
import {_PERMISSION_EXECUTE_RELAY_CALL} from "../LSP6Constants.sol";

// errors
import {NotAuthorised} from "../LSP6Errors.sol";

abstract contract LSP6ExecuteRelayCallModule {
    function _verifyExecuteRelayCallPermission(
        address controllerAddress,
        bytes32 controllerPermissions
    ) internal pure {
        if (
            !LSP6Utils.hasPermission(
                controllerPermissions,
                _PERMISSION_EXECUTE_RELAY_CALL
            )
        ) {
            revert NotAuthorised(controllerAddress, "EXECUTE_RELAY_CALL");
        }
    }
}
