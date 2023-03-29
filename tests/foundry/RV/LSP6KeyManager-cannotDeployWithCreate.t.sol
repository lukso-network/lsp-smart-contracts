// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotDeployWithCreate is LSP6KeyManagerTest {
    /**
     * Test that you cannot deploy a contract with the CREATE opcode through
     * the account without the correct permission.
     */
    function testCannotDeployWithCreate(
        address controller,
        address target, // should be ignored when deploying
        uint256 value,
        bytes memory data
    ) public {
        vm.assume(data.length > 0);

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_DEPLOY);

        vm.startPrank(controller);

        expectRevert(controller, "DEPLOY");

        deployWithCreateViaKeyManager(target, value, data);

        vm.stopPrank();
    }
}
