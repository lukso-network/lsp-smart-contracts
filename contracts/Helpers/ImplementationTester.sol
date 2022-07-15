// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract ImplementationTester is Initializable {
    address private _owner;

    function initialize(address newOwner) public virtual initializer {
        _owner = newOwner;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }
}
