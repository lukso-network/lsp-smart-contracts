// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeUniversalReceiverDelegate is LSP6KeyManagerTest {
    /**
     * Test that you cannot change the account's universal receiver delegate
     * without the correct permission.
     */
    function testCannotChangeUniversalReceiverDelegate(
        address controller,
        address oldDelegate,
        address newDelegate
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE);

        // Add delegate to be changed
        setDelegateViaKeyManager(oldDelegate);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEUNIVERSALRECEIVERDELEGATE");

        setDelegateViaKeyManager(newDelegate);

        vm.stopPrank();
    }
}
