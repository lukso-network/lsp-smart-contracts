// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddExtensions is LSP6KeyManagerTest {
    /**
     * Test that you cannot add an LSP17 extension to the account without the
     * correct permission.
     */
    function testCannotAddExtensions(
        address controller,
        bytes4 functionSelector,
        address extension
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDEXTENSIONS);

        vm.startPrank(controller);
        expectRevert(controller, "ADDEXTENSIONS");
        setExtensionViaKeyManager(functionSelector, extension);
        vm.stopPrank();
    }
}
