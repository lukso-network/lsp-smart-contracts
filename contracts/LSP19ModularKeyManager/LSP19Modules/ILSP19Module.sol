// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

import {LSP6ExecuteModule} from "../../LSP6KeyManager/LSP6Modules/LSP6ExecuteModule.sol";

interface ILSP19Module {
    /**
     * @dev Verifies the permissions of the callr for a specific method
     * @param target Address of the target contract of the Key Manager
     * @param from Address whoose permissions are checked
     * @param permissions The permissions of the `from` for the `target` contract
     * @param payload The checked payload
     */
    function verifyMethodLogic(
        address target,
        address from,
        bytes32 permissions,
        bytes calldata payload
    ) external;
}
