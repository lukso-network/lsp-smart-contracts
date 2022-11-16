// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev This contract is used only for testing purposes
 */
contract ReenterAccountExtension {
    function reenterAccount(bytes memory payload) public {
        (bool success, bytes memory result) = msg.sender.call(payload);
        require(success);
    }
}
