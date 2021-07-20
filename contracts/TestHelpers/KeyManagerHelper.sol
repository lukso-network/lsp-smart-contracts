// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * Helper contract to test internal functions of the KeyManager
 */

import { KeyManager } from '../KeyManager/KeyManager.sol';

contract KeyManagerHelper is KeyManager {

    constructor(address _account)
        KeyManager(_account) {}

    function getUserPermissions(address _user) public view returns (bytes1) {
        return super._getUserPermissions(_user);
    }

    function getAllowedAddresses(address _sender) public view returns (bytes memory) {
        return super._getAllowedAddresses(_sender);
    }

    function getAllowedFunctions(address _sender) public view returns (bytes memory) {
        return super._getAllowedFunctions(_sender);
    }

    function isAllowedAddress(address _sender, address _recipient) public view returns (bool) {
        return super._isAllowedAddress(_sender, _recipient);
    }

    function isAllowedFunction(address _sender, bytes4 _function) public view returns (bool) {
        return super._isAllowedFunction(_sender, _function);
    }

}