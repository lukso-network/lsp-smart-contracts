// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeAddress is LSP6KeyManagerTest {
    /**
     * Test that you cannot change an address in AddressPermissions[] without
     * the correct permission.
     */
    function testCannotChangeAddress(
        address controller,
        uint128 index,
        address oldAddress,
        address newAddress
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEPERMISSIONS);

        // Add an address to be changed
        setAddressViaKeyManager(index, oldAddress);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEPERMISSIONS");

        setAddressViaKeyManager(index, newAddress);

        vm.stopPrank();
    }
}
