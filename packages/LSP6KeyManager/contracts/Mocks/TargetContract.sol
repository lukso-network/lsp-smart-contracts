// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev sample contract to test interaction + state changes:
 *      - directly from Universal Profile
 *      - via KeyManager > UniversalProfile
 */
contract TargetContract {
    uint256 private _number = 5;
    string private _name = "Simple Contract Name";

    function getNumber() public view returns (uint256) {
        return _number;
    }

    function setNumber(uint256 newNumber) public {
        _number = newNumber;
    }

    function getName() public view returns (string memory) {
        return _name;
    }

    function setName(string memory name) public {
        _name = name;
    }

    function setNamePayable(string memory name) public payable {
        _name = name;
    }

    function setNamePayableMinimumValue(string memory name) public payable {
        require(msg.value >= 50, "Not enough value provided");
        _name = name;
    }

    function revertCall() public pure {
        revert("TargetContract:revertCall: this function has reverted!");
    }

    function getDynamicArrayOf2Numbers()
        public
        pure
        returns (uint256[] memory)
    {
        uint256[] memory results = new uint256[](2);
        results[0] = 10;
        results[1] = 20;
        return results;
    }
}
