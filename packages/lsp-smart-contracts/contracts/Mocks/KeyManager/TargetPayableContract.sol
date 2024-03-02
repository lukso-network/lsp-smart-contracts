// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

contract TargetPayableContract {
    uint256 public value;

    function updateState(uint256 newValue) public payable {
        value = newValue;
    }
}
