// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotAddMappedDelegate is LSP6KeyManagerTest {
    /**
     * Test that you cannot add a mapped universal receiver delegate to the
     * account without the correct permission.
     */
    function testCannotAddMappedDelegate(
        address controller,
        bytes32 typeId,
        address universalReceiverDelegate
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE);

        vm.startPrank(controller);
        expectRevert(controller, "ADDUNIVERSALRECEIVERDELEGATE");
        setMappedDelegateViaKeyManager(typeId, universalReceiverDelegate);
        vm.stopPrank();
    }
}
