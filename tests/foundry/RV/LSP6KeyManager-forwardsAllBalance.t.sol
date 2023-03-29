// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

contract LSP6KeyManagerForwardsAllBalance is LSP6KeyManagerTest {
    /**
     * Test that the key manager forwards all balance sent with a call
     */
    function testKeyManagerForwardsAllBalance(
        address target,
        uint256 initialBalance,
        uint256 value,
        bytes memory data
    ) public {
        // Avoid precompiled contracts, which trigger undefined behavior
        vm.assume(target > address(0x9));

        initializeAccountAndKeyManager();

        vm.deal(address(keyManager), initialBalance);

        uint256 boundedValue = bound(value, 0, MAX_UINT256 - initialBalance);
        vm.deal(address(this), boundedValue);

        makeCallViaKeyManager(target, boundedValue, boundedValue, data);

        assertEq(address(keyManager).balance, initialBalance);
    }
}
