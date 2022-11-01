// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// libraries
import {LSP6Utils} from "../../LSP6KeyManager/LSP6Utils.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {LSP6KeyManager} from "../../LSP6KeyManager/LSP6KeyManager.sol";

/**
 * Helper contract to test internal functions of the KeyManager
 */
contract KeyManagerInternalTester is LSP6KeyManager {
    using LSP6Utils for *;

    /* solhint-disable no-empty-blocks */
    constructor(address _account) LSP6KeyManager(_account) {}

    function getPermissionsFor(address _address) public view returns (bytes32) {
        return ERC725Y(target).getPermissionsFor(_address);
    }

    function getAllowedERC725YKeysFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedERC725YKeysFor(_address);
    }

    function verifyAllowedERC725YKeys(address _from, bytes32[] memory _inputKeys) public view {
        super._verifyAllowedERC725YKeys(_from, _inputKeys);
    }

    function hasPermission(bytes32 _addressPermission, bytes32 _permissions)
        public
        pure
        returns (bool)
    {
        return _addressPermission.hasPermission(_permissions);
    }

    function countTrailingZeroBytes(bytes32 _key) public pure returns (uint256 zeroBytesCount_) {
        return super._countTrailingZeroBytes(_key);
    }
}
