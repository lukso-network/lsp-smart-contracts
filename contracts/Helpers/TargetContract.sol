// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract TargetContract {

    /* solhint-disable */
    uint number = 5;
    string name = "Simple Contract Name";
    /* solhint-enable */

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

    function revertCall() public pure {
        revert("TargetContract:revertCall: this function has reverted!");
    }
    
}