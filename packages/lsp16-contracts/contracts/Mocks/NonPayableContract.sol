// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

contract NonPayableContract {
    address private _owner;

    constructor(address newOwner) {
        _owner = newOwner;
    }

    function getOwner() public view returns (address) {
        return _owner;
    }
}
