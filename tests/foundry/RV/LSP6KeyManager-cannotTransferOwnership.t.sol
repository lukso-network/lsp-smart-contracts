// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotTransferOwnership is LSP6KeyManagerTest {
    /**
     * Test that you cannot transfer ownership without the correct permission.
     */
    function testCannotTransferOwnership(address controller, address newOwner) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEOWNER);

        vm.startPrank(controller);
        expectRevert(controller, "TRANSFEROWNERSHIP");
        transferOwnershipViaKeyManager(newOwner);
        vm.stopPrank();
    }
}
