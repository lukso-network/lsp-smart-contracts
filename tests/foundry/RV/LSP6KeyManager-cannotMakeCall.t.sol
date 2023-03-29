// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotMakeCall is LSP6KeyManagerTest {
    /**
     * Test that you cannot make a non-static call through the account without
     * the correct permission.
     */
    function testCannotMakeCall(
        address controller,
        address target,
        uint256 value,
        bytes memory data
    ) public {
        vm.assume(data.length > 0);

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_SUPER_CALL | _PERMISSION_CALL);

        vm.deal(address(account), value);

        vm.startPrank(controller);

        expectRevert(controller, "CALL");

        makeCallViaKeyManager(target, 0, value, data);

        vm.stopPrank();
    }
}
