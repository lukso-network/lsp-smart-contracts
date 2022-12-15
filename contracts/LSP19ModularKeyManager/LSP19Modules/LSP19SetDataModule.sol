// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interface
import {ILSP19Module} from "./ILSP19Module.sol";

// module
import {LSP6SetDataModule} from "../../LSP6KeyManager/LSP6Modules/LSP6SetDataModule.sol";

contract LSP19SetDataModule is ILSP19Module, LSP6SetDataModule {
    /**
     * @inheritdoc ILSP19Module
     */
    function verifyMethodLogic(
        address target,
        address from,
        bytes32 permissions,
        bytes calldata payload
    ) external view {
        _verifySetDataPermissions(target, from, permissions, payload);
    }
}
