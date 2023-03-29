// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeAllowedCalls is LSP6KeyManagerTest {
    /**
     * Test that you cannot change allowed calls of an address without the
     * correct permission.
     */
    function testCannotChangeAllowedCalls(
        address controller,
        address newController,
        bytes32 oldAllowedCall,
        bytes32 newAllowedCall
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEPERMISSIONS);

        // Add allowed call to be changed
        setAllowedCallViaKeyManager(newController, oldAllowedCall);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEPERMISSIONS");

        setAllowedCallViaKeyManager(newController, newAllowedCall);

        vm.stopPrank();
    }
}
