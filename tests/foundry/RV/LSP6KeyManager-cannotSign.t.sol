// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LSP6KeyManager.t.sol";

import {_ERC1271_FAILVALUE} from "../../../contracts/LSP0ERC725Account/LSP0Constants.sol";

contract LSP6KeyManagerCannotSign is LSP6KeyManagerTest {
    /**
     * Test that your signature is invalid without permission.
     */
    function testCannotSign(uint256 privateKey, bytes32 dataHash) public {
        vm.assume(privateKey != 0);
        vm.assume(privateKey < SECP256K1_CURVE_ORDER);

        initializeAccountAndKeyManager();

        address controller = vm.addr(privateKey);

        setPermissionsViaKeyManagerExcept(controller, _PERMISSION_SIGN);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, dataHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(controller);

        bytes4 result = keyManager.isValidSignature(dataHash, signature);

        assertEq(result, _ERC1271_FAILVALUE);

        vm.stopPrank();
    }
}
