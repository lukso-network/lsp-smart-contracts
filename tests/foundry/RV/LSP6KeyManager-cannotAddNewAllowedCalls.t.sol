// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddNewAllowedCalls is LSP6KeyManagerTest {
    /**
     * Test that you cannot add new allowed calls to an address without the
     * correct permission.
     */
    function testCannotAddNewAllowedCalls(
        address controller,
        address newController,
        bytes32 allowedCall
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDCONTROLLER);

        vm.startPrank(controller);

        expectRevert(controller, "ADDCONTROLLER");

        setAllowedCallViaKeyManager(newController, allowedCall);

        vm.stopPrank();
    }
}
