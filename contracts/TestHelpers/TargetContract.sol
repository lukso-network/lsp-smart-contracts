// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.7.0 <=0.9.0;

contract TargetContract {

    uint number = 5;
    string name = "Simple Contract Name";

    function getNumber() public view returns (uint) {
        return number;
    }

    function setNumber(uint _newNumber) public {
        number = _newNumber;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function setName(string memory _name) public {
        name = _name;
    }
    
}