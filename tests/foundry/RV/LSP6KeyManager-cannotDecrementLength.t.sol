// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotDecrementLength is LSP6KeyManagerTest {
    /**
     * Test that you cannot decrement length of AddressPermissions[] without the
     * correct permission.
     */
    function testCannotDecrementLength(
        address controller,
        uint256 oldLength,
        uint256 newLength
    ) public {
        vm.assume(oldLength > 0);

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEPERMISSIONS);

        setArrayLengthViaKeyManager(oldLength);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEPERMISSIONS");

        uint256 boundedLength = bound(newLength, 0, oldLength - 1);
        setArrayLengthViaKeyManager(boundedLength);

        vm.stopPrank();
    }
}
