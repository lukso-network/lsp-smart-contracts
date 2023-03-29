// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddNewAllowedDataKeys is LSP6KeyManagerTest {
    /**
     * Test that you cannot add new allowed data keys to an address without the
     * correct permission.
     */
    function testCannotAddNewAllowedDataKeys(
        address controller,
        address newController,
        bytes32 allowedDataKey
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDCONTROLLER);

        vm.startPrank(controller);

        expectRevert(controller, "ADDCONTROLLER");

        setAllowedDataKeyViaKeyManager(newController, allowedDataKey);

        vm.stopPrank();
    }
}
