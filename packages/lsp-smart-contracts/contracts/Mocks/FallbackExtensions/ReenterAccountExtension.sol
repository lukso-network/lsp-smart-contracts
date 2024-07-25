// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract ReenterAccountExtension {
    function reenterAccount(bytes memory payload) public {
        (bool success, ) = msg.sender.call(payload);
        // solhint-disable-next-line reason-string
        require(success);
    }
}
