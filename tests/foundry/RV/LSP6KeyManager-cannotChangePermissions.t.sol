// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangePermissions is LSP6KeyManagerTest {
    /**
     * Test that you cannot change permissions of an address without the
     * correct permission.
     */
    function testCannotChangePermissions(
        address controller,
        address otherController,
        bytes32 oldPermissions,
        bytes32 newPermissions
    ) public {
        vm.assume(otherController != controller);
        vm.assume(oldPermissions != newPermissions);
        vm.assume(oldPermissions != bytes32(0));

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEPERMISSIONS);

        // Add permissions to be changed
        setPermissionsViaKeyManager(otherController, oldPermissions);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEPERMISSIONS");

        setPermissionsViaKeyManager(otherController, newPermissions);

        vm.stopPrank();
    }
}
