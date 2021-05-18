// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.7.0 <=0.9.0;

contract SimpleContract {

    uint number;

    function getNumber() public view returns (uint) {
        return number;
    }

    function setNumber(uint _newNumber) public {
        number = _newNumber;
    }
    
}