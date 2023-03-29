// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerCannotChangeMappedDelegate is LSP6KeyManagerTest {
    /**
     * Test that you cannot change the account's mapped universal receiver
     * delegate without the correct permission.
     */
    function testCannotChangeMappedDelegate(
        address controller,
        bytes32 typeId,
        address oldDelegate,
        address newDelegate
    ) public {
        initializeAccountAndKeyManager();

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE);

        // Add delegate to be changed
        setMappedDelegateViaKeyManager(typeId, oldDelegate);

        vm.startPrank(controller);

        expectRevert(controller, "CHANGEUNIVERSALRECEIVERDELEGATE");

        setMappedDelegateViaKeyManager(typeId, newDelegate);

        vm.stopPrank();
    }
}
