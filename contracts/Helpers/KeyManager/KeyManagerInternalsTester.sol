// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// libraries
import {LSP6Utils} from "../../LSP6KeyManager/LSP6Utils.sol";
import {LSP2Utils} from "../../LSP2ERC725YJSONSchema/LSP2Utils.sol";

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

    function getAllowedAddressesFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedAddressesFor(_address);
    }

    function getAllowedFunctionsFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedFunctionsFor(_address);
    }

    function getAllowedERC725YKeysFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedERC725YKeysFor(_address);
    }

    function verifyAllowedAddress(address _sender, address _recipient) public view {
        super._verifyAllowedAddress(_sender, _recipient);
    }

    function verifyAllowedFunction(address _sender, bytes4 _function) public view {
        super._verifyAllowedFunction(_sender, _function);
    }

    function checkValidCompactBytesArray(bytes memory compactBytesArray)
        public
        pure
        returns (bool)
    {
        return LSP2Utils.isValidCompactBytesArray(compactBytesArray);
    }

    function verifyAllowedERC725YSingleKey(
        address from,
        bytes32 inputKey,
        bytes memory allowedERC725YKeysFor
    ) public pure returns (bool) {
        super._verifyAllowedERC725YSingleKey(from, inputKey, allowedERC725YKeysFor);
        return true;
    }

    function verifyAllowedERC725YKeys(
        address from,
        bytes32[] memory inputKeys,
        bytes memory allowedERC725YKeysCompacted
    ) public pure returns (bool) {
        super._verifyAllowedERC725YKeys(from, inputKeys, allowedERC725YKeysCompacted);
        return true;
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
