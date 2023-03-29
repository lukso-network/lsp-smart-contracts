// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotTransferValue is LSP6KeyManagerTest {
    /**
     * Test that you cannot transfer value from the account without the
     * correct permission.
     */
    function testCannotTransferValue(
        address controller,
        address target,
        uint256 value,
        bytes memory data
    ) public {
        vm.assume(value > 0);

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(
            controller,
            _PERMISSION_SUPER_TRANSFERVALUE | _PERMISSION_TRANSFERVALUE
        );

        vm.deal(address(account), value);

        vm.startPrank(controller);

        expectRevert(controller, "TRANSFERVALUE");

        makeCallViaKeyManager(target, 0, value, data);

        vm.stopPrank();
    }
}
