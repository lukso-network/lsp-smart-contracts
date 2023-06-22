// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract AddressRegistry is ERC165Storage {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal _addressStore;

    function addAddress(address _address) public virtual returns (bool) {
        return _addressStore.add(_address);
    }

    function removeAddress(address _address) public virtual returns (bool) {
        return _addressStore.remove(_address);
    }

    function getAddress(uint256 _index) public view returns (address) {
        return _addressStore.at(_index);
    }

    function getIndex(address _address) public view returns (uint256) {
        require(
            _addressStore.contains(_address),
            "EnumerableSet: Index not found"
        );
        return
            _addressStore._inner._indexes[bytes32(uint256(uint160(_address)))] -
            1;
    }

    function getAllRawValues() public view returns (bytes32[] memory) {
        return _addressStore._inner._values;
    }

    function containsAddress(address _address) public view returns (bool) {
        return _addressStore.contains(_address);
    }

    function length() public view returns (uint256) {
        return _addressStore.length();
    }
}
