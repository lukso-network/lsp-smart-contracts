// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// libraries
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract AddressRegistry is ERC165Storage {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal addressStore;

    function addAddress(address _address) public virtual returns (bool) {
        return addressStore.add(_address);
    }

    function removeAddress(address _address) public virtual returns (bool) {
        return addressStore.remove(_address);
    }

    function getAddress(uint256 _index) public view returns (address) {
        return addressStore.at(_index);
    }

    function getIndex(address _address) public view returns (uint256) {
        require(addressStore.contains(_address), "EnumerableSet: Index not found");
        return addressStore._inner._indexes[bytes32(uint256(uint160(_address)))] - 1;
    }

    function getAllRawValues() public view returns (bytes32[] memory) {
        return addressStore._inner._values;
    }

    function containsAddress(address _address) public view returns (bool) {
        return addressStore.contains(_address);
    }

    function length() public view returns (uint256) {
        return addressStore.length();
    }
}
