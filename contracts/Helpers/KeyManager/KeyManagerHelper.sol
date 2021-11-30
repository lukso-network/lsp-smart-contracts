// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../LSP6KeyManager/LSP6KeyManager.sol";

/**
 * Helper contract to test internal functions of the KeyManager
 */
contract KeyManagerHelper is LSP6KeyManager {
    using LSP6Utils for ERC725;

    /* solhint-disable no-empty-blocks */
    constructor(address _account) LSP6KeyManager(_account) {}

    function getInterfaceId() public pure returns (bytes4) {
        return _INTERFACEID_LSP6;
    }

    function getAddressPermissions(address _address)
        public
        view
        returns (bytes32)
    {
        return account.getPermissionsFor(_address);
    }


    function getAllowedAddresses(address _address)
        public
        view
        returns (bytes memory)
    {
        return account.getAllowedAddressesFor(_address);
    }

    function getAllowedFunctions(address _address)
        public
        view
        returns (bytes memory)
    {

        return account.getAllowedFunctionsFor(_address);
    }

    function verifyIfAllowedAddress(address _sender, address _recipient)
        public
        view
    {
        super._verifyAllowedAddress(_sender, _recipient);
    }

    function verifyIfAllowedFunction(address _sender, bytes4 _function)
        public
        view
    {
        super._verifyAllowedFunction(_sender, _function);
    }

    function isAllowed(bytes32 _permission, bytes32 _addressPermission)
        public
        pure
        returns (bool)
    {
        return super._hasPermission(_permission, _addressPermission);
    }
}
