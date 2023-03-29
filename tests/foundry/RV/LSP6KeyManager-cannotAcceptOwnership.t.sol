// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAcceptOwnership is LSP6KeyManagerTest {
    /**
     * Test that you cannot accept ownership without the correct permission.
     */
    function testCannotAcceptOwnership(address controller, address tmpOwner) public {
        // Avoid precompiled contracts, which trigger undefined behavior
        vm.assume(tmpOwner > address(0x9));

        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEOWNER);

        // Temporarily change owner so that key manager is pending owner

        transferOwnershipViaKeyManager(tmpOwner);
        vm.startPrank(tmpOwner);
        account.acceptOwnership();
        account.transferOwnership(address(keyManager));
        vm.stopPrank();

        // Now key manager is pending owner, can call acceptOwnership

        vm.startPrank(controller);
        expectRevert(controller, "TRANSFEROWNERSHIP");
        acceptOwnershipViaKeyManager();
        vm.stopPrank();
    }
}
