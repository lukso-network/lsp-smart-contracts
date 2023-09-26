// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ImplementationTester is Initializable {
    address private _owner;

    function initialize(address newOwner) public virtual initializer {
        _owner = newOwner;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }
}
