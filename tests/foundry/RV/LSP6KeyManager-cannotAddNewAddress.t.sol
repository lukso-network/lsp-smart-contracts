// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddNewAddress is LSP6KeyManagerTest {
    /**
     * Test that you cannot add a new address to AddressPermissions[] without
     * the correct permission.
     */
    function testCannotAddNewAddress(
        address controller,
        uint128 newIndex,
        address newAddress
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDCONTROLLER);

        vm.startPrank(controller);
        expectRevert(controller, "ADDCONTROLLER");
        setAddressViaKeyManager(newIndex, newAddress);
        vm.stopPrank();
    }
}
