// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotMakeStaticCall is LSP6KeyManagerTest {
    /**
     * Test that you cannot make a static call through the account without the
     * correct permission.
     */
    function testCannotMakeStaticCall(
        address controller,
        address target,
        bytes memory data
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(
            controller,
            _PERMISSION_SUPER_STATICCALL | _PERMISSION_STATICCALL
        );

        vm.startPrank(controller);

        expectRevert(controller, "STATICCALL");

        makeStaticCallViaKeyManager(target, data);

        vm.stopPrank();
    }
}
