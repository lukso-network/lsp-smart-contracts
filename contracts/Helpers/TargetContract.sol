// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev sample contract to test interaction + state changes:
 *      - directly from Universal Profile
 *      - via KeyManager > UniversalProfile
 *
 * also used to test permissions ALLOWEDADDRESS and ALLOWEDSTANDARDS
 */
contract TargetContract {
    /* solhint-disable */
    uint256 number = 5;
    string name = "Simple Contract Name";

    /* solhint-enable */

    function getNumber() public view returns (uint256) {
        return number;
    }

    function setNumber(uint256 _newNumber) public {
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
