// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotIncrementLength is LSP6KeyManagerTest {
    /**
     * Test that you cannot increment length of AddressPermissions[] without the
     * correct permission.
     */
    function testCannotIncrementLength(
        address controller,
        uint256 oldLength,
        uint256 newLength
    ) public {
        vm.assume(oldLength < MAX_UINT256);

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDCONTROLLER);

        setArrayLengthViaKeyManager(oldLength);

        vm.startPrank(controller);

        expectRevert(controller, "ADDCONTROLLER");

        uint256 boundedLength = bound(newLength, oldLength + 1, MAX_UINT256);
        setArrayLengthViaKeyManager(boundedLength);

        vm.stopPrank();
    }
}
