// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract CheckerExtension {
    // solhint-disable reason-string
    // Checks that the msg.sender + msg.value are appended to the msg.data
    // Length should be: 4 + 32 + 32 + 20 + 32
    // 4bytes function selector + 32bytes parameter address + 32bytes parameter uint256
    // + 20bytes msg.sender appended + 32bytes msg.value appended
    function checkMsgVariable(
        address originalMsgSender,
        uint256 originalMsgValue
    ) public payable returns (bool) {
        if (msg.data.length != 120) revert();
        if (
            originalMsgSender !=
            address(
                bytes20(msg.data[msg.data.length - 52:msg.data.length - 32])
            )
        ) revert();

        if (
            originalMsgValue !=
            uint256(bytes32((msg.data[msg.data.length - 32:])))
        ) revert();
        return true;
    }
}
