// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeAllowedDataKeys is LSP6KeyManagerTest {
    /**
     * Test that you cannot change allowed data keys of an address without the
     * correct permission.
     */
    function testCannotChangeAllowedDataKeys(
        address controller,
        address newController,
        bytes32 oldAllowedDataKey,
        bytes32 newAllowedDataKey
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEPERMISSIONS);

        // Add allowed data key to be changed
        setAllowedDataKeyViaKeyManager(newController, oldAllowedDataKey);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEPERMISSIONS");

        setAllowedDataKeyViaKeyManager(newController, newAllowedDataKey);

        vm.stopPrank();
    }
}
