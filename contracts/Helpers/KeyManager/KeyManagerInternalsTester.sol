// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

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

    constructor(address _account) LSP6KeyManager(_account) {}

    function getPermissionsFor(address _address) public view returns (bytes32) {
        return ERC725Y(target).getPermissionsFor(_address);
    }

    function getAllowedCallsFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedCallsFor(_address);
    }

    function getAllowedERC725YDataKeysFor(address _address) public view returns (bytes memory) {
        return ERC725Y(target).getAllowedERC725YDataKeysFor(_address);
    }

    function verifyAllowedCall(address _sender, bytes calldata _payload) public view {
        super._verifyAllowedCall(_sender, _payload);
    }

    function isCompactBytesArray(bytes memory compactBytesArray) public pure returns (bool) {
        return LSP2Utils.isCompactBytesArray(compactBytesArray);
    }

    function verifyAllowedERC725YSingleKey(
        address from,
        bytes32 inputKey,
        bytes memory allowedERC725YDataKeysFor
    ) public pure returns (bool) {
        super._verifyAllowedERC725YSingleKey(from, inputKey, allowedERC725YDataKeysFor);
        return true;
    }

    function verifyAllowedERC725YDataKeys(
        address from,
        bytes32[] memory inputKeys,
        bytes memory allowedERC725YDataKeysCompacted
    ) public pure returns (bool) {
        super._verifyAllowedERC725YDataKeys(from, inputKeys, allowedERC725YDataKeysCompacted);
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
