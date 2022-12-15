// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interface
import {LSP19Module} from "./ILSP19Module.sol";

// module
import {LSP6ExecuteModule} from "../../LSP6KeyManager/LSP6Modules/LSP6ExecuteModule.sol";

contract LSP19ExecuteModule is LSP19Module, LSP6ExecuteModule {
    /**
     * @inheritdoc LSP19Module
     */
    function verifyMethodLogic(
        address target,
        address from,
        bytes32 permissions,
        bytes calldata payload
    ) external view {
        _verifyExecutePermissions(target, from, permissions, payload);
    }
}
