// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";

contract LSP6SetDataUnrestrictedController is LSP6KeyManager {
    constructor(address target_) LSP6KeyManager(target_) {}

    function givePermissionsToController(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function restrictControllerToERC725YKeys(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }
}
