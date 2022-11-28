// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract ReenterAccountExtension {
    function reenterAccount(bytes memory payload) public {
        // solhint-disable
        (bool success, bytes memory result) = msg.sender.call(payload);
        require(success);
    }
}
