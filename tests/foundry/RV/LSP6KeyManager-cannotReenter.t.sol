// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract CallerContract {
    function callExecute(LSP6KeyManager keyManager, bytes memory data) public {
        keyManager.execute(data);
    }
}

contract LSP6KeyManagerCannotReenter is LSP6KeyManagerTest {
    /**
     * Test that the account is not reentrant without the correct permission.
     */
    function testCannotReenter(bytes memory data) public {
        vm.assume(data.length > 4);
        initializeAccountAndKeyManager();

        CallerContract caller = new CallerContract();
        address controller = address(caller);

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_REENTRANCY);

        vm.startPrank(controller);

        expectRevert(controller, "REENTRANCY");

        makeCallViaKeyManager(
            controller,
            0,
            0,
            abi.encodeWithSelector(CallerContract.callExecute.selector, keyManager, data)
        );

        vm.stopPrank();
    }
}
