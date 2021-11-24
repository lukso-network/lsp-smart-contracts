// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../LSP6KeyManager/LSP6KeyManager.sol";

/**
 * Helper contract to test internal functions of the KeyManager
 */
contract KeyManagerHelper is LSP6KeyManager {
    using ERC725Utils for ERC725Y;

    /* solhint-disable no-empty-blocks */
    constructor(address _account) LSP6KeyManager(_account) {}

    function getInterfaceId() public pure returns (bytes4) {
        return _LSP6_INTERFACE_ID;
    }

    function getUserPermissions(address _user) public view returns (bytes32) {
        return super._getAddressPermissions(_user);
    }

    function getAllowedAddresses(address _sender) public view returns (bytes memory) {
        return
            ERC725Y(account).getDataSingle(
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _ADDRESS_ALLOWEDADDRESSES,
                    bytes20(_sender)
                )
            );
    }

    function getAllowedFunctions(address _sender) public view returns (bytes memory) {
        return
            ERC725Y(account).getDataSingle(
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _ADDRESS_ALLOWEDFUNCTIONS,
                    bytes20(_sender)
                )
            );
    }

    function verifyIfAllowedAddress(address _sender, address _recipient) public view {
        super._verifyAllowedAddress(_sender, _recipient);
    }

    function verifyIfAllowedFunction(address _sender, bytes4 _function) public view {
        super._verifyAllowedFunction(_sender, _function);
    }

    function isAllowed(bytes32 _permission, bytes32 _addressPermission) public pure returns (bool) {
        return super._hasPermission(_permission, _addressPermission);
    }
}
