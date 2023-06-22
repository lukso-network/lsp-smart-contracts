// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {AddressRegistry} from "./AddressRegistry.sol";

// constants
import {
    _INTERFACEID_ERC725Y
} from "@erc725/smart-contracts/contracts/constants.sol";

contract AddressRegistryRequiresERC725 is AddressRegistry {
    using EnumerableSet for EnumerableSet.AddressSet;

    function addAddress(address _address) public override returns (bool) {
        require(
            ERC165(_address).supportsInterface(_INTERFACEID_ERC725Y),
            "Only ERC725Y addresses can be added"
        );
        return _addressStore.add(_address);
    }

    function removeAddress(address _address) public override returns (bool) {
        require(
            ERC165(msg.sender).supportsInterface(_INTERFACEID_ERC725Y),
            "Only ERC725Y can call this function"
        );
        require(msg.sender == _address, "Only an address can remove itself.");
        return _addressStore.remove(_address);
    }
}
