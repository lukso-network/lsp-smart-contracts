// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddNewPermissions is LSP6KeyManagerTest {
    /**
     * Test that you cannot add new permissions to an address without the
     * correct permission.
     */
    function testCannotAddNewPermissions(
        address controller,
        address newController,
        bytes32 newPermissions
    ) public {
        vm.assume(newController != controller);
        vm.assume(newController != address(this));

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDCONTROLLER);

        vm.startPrank(controller);
        expectRevert(controller, "ADDCONTROLLER");
        setPermissionsViaKeyManager(newController, newPermissions);
        vm.stopPrank();
    }
}
