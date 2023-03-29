// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeExtensions is LSP6KeyManagerTest {
    /**
     * Test that you cannot change the LSP17 extension of the account without
     * the correct permission.
     */
    function testCannotChangeExtensions(
        address controller,
        bytes4 functionSelector,
        address oldExtension,
        address newExtension
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEEXTENSIONS);

        // Add extension to be changed
        setExtensionViaKeyManager(functionSelector, oldExtension);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEEXTENSIONS");

        setExtensionViaKeyManager(functionSelector, newExtension);

        vm.stopPrank();
    }
}
