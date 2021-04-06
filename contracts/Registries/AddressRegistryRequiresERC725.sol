// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;


// libraries
import "./AddressRegistry.sol";


contract AddressRegistryRequiresERC725 is AddressRegistry {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes4 _INTERFACE_ID_ERC725Y = 0x2bd57b73;

    function addAddress(address _address)
    public
    override
    returns(bool)
    {
        require(ERC165(_address).supportsInterface(_INTERFACE_ID_ERC725Y), 'Only ERC725Y addresses can be added');
        return addressStore.add(_address);
    }

    function removeAddress(address _address)
    public
    override
    returns(bool)
    {
        require(ERC165(msg.sender).supportsInterface(_INTERFACE_ID_ERC725Y), 'Only ERC725Y can call this function');
        require(msg.sender == _address, 'Only an address can remove itself.');
        return addressStore.remove(_address);
    }
}
