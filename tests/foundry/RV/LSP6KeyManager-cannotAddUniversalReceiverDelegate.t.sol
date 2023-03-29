// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddUniversalReceiverDelegate is LSP6KeyManagerTest {
    /**
     * Test that you cannot add a universal receiver delegate to the account
     * without the correct permission.
     */
    function testCannotAddUniversalReceiverDelegate(
        address controller,
        address universalReceiverDelegate
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE);

        vm.startPrank(controller);
        expectRevert(controller, "ADDUNIVERSALRECEIVERDELEGATE");
        setDelegateViaKeyManager(universalReceiverDelegate);
        vm.stopPrank();
    }
}
