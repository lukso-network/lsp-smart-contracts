// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract ReceiveContract {
    event Received(address, uint);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
