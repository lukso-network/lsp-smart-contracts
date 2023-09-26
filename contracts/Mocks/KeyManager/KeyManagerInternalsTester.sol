// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

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

    constructor(address _account) LSP6KeyManager(_account) {}

    function getPermissionsFor(address _address) public view returns (bytes32) {
        return ERC725Y(_target).getPermissionsFor(_address);
    }

    function getAllowedCallsFor(
        address _address
    ) public view returns (bytes memory) {
        return ERC725Y(_target).getAllowedCallsFor(_address);
    }

    function getAllowedERC725YDataKeysFor(
        address _address
    ) public view returns (bytes memory) {
        return ERC725Y(_target).getAllowedERC725YDataKeysFor(_address);
    }

    function verifyAllowedCall(
        address _sender,
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) public view {
        super._verifyAllowedCall(
            _target,
            _sender,
            operationType,
            to,
            value,
            data
        );
    }

    function isCompactBytesArrayOfAllowedCalls(
        bytes memory allowedCallsCompacted
    ) public pure returns (bool) {
        return allowedCallsCompacted.isCompactBytesArrayOfAllowedCalls();
    }

    function isCompactBytesArrayOfAllowedERC725YDataKeys(
        bytes memory allowedERC725YDataKeysCompacted
    ) public pure returns (bool) {
        return
            allowedERC725YDataKeysCompacted
                .isCompactBytesArrayOfAllowedERC725YDataKeys();
    }

    function verifyCanSetData(
        address controller,
        bytes32 permissions,
        bytes32[] memory inputDataKeys,
        bytes[] memory inputDataValues
    ) public view {
        super._verifyCanSetData(
            _target,
            controller,
            permissions,
            inputDataKeys,
            inputDataValues
        );
    }

    function verifyAllowedERC725YSingleKey(
        address from,
        bytes32 inputKey,
        bytes memory allowedERC725YDataKeysFor
    ) public pure {
        super._verifyAllowedERC725YSingleKey(
            from,
            inputKey,
            allowedERC725YDataKeysFor
        );
    }

    function verifyAllowedERC725YDataKeys(
        address from,
        bytes32[] memory inputKeys,
        bytes memory allowedERC725YDataKeysCompacted,
        bool[] memory validatedInputKeys,
        uint256 allowedDataKeysFound
    ) public pure {
        super._verifyAllowedERC725YDataKeys(
            from,
            inputKeys,
            allowedERC725YDataKeysCompacted,
            validatedInputKeys,
            allowedDataKeysFound
        );
    }

    function hasPermission(
        bytes32 _addressPermission,
        bytes32 _permissions
    ) public pure returns (bool) {
        return _addressPermission.hasPermission(_permissions);
    }

    function verifyPermissions(
        address from,
        uint256 msgValue,
        bytes calldata payload
    ) public view {
        super._verifyPermissions(target(), from, msgValue, payload);
    }
}
