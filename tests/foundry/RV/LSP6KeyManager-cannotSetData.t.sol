// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotSetData is LSP6KeyManagerTest {
    /**
     * Test that you cannot set data in the account's key-value storage without
     * the correct permission.
     */
    function testCannotSetData(
        address controller,
        bytes32 key,
        bytes memory value
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(
            controller,
            _PERMISSION_SUPER_SETDATA | _PERMISSION_SETDATA
        );

        vm.startPrank(controller);
        expectRevert(controller, "SETDATA");
        setDataViaKeyManager(key, value);
        vm.stopPrank();
    }
}
