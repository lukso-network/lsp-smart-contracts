// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

contract ContractNoConstructor {
    uint256 private _number = 5;

    function getNumber() public view returns (uint256) {
        return _number;
    }

    function setNumber(uint256 newNumber) public {
        _number = newNumber;
    }
}
