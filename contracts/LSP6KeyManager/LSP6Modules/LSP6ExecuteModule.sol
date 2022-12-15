// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Checker} from "../../Custom/ERC165Checker.sol";
import {LSP2Utils} from "../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6Utils} from "../LSP6Utils.sol";

// errors
import "../LSP6Errors.sol";

// constants
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import "../LSP6Constants.sol";

/**
 * @title Core implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6ExecuteModule {
    using LSP6Utils for *;
    using ERC165Checker for address;

    function _verifyExecutePermissions(
        address from,
        bytes32 permissions,
        bytes calldata payload,
        address target
    ) internal view {
        uint256 operationType = uint256(bytes32(payload[4:36]));
        require(operationType < 5, "LSP6KeyManager: invalid operation type");

        require(
            operationType != OPERATION_4_DELEGATECALL,
            "LSP6KeyManager: operation DELEGATECALL is currently disallowed"
        );

        uint256 value = uint256(bytes32(payload[68:100]));

        // prettier-ignore
        bool isContractCreation = operationType == OPERATION_1_CREATE || operationType == OPERATION_2_CREATE2;
        bool isCallDataPresent = payload.length > 164;

        // SUPER operation only applies to contract call, not contract creation
        bool hasSuperOperation = isContractCreation
            ? false
            : permissions.hasPermission(_extractSuperPermissionFromOperation(operationType));

        if (isCallDataPresent && !hasSuperOperation) {
            _requirePermissions(from, permissions, _extractPermissionFromOperation(operationType));
        }

        bool hasSuperTransferValue = permissions.hasPermission(_PERMISSION_SUPER_TRANSFERVALUE);

        if (value != 0 && !hasSuperTransferValue) {
            _requirePermissions(from, permissions, _PERMISSION_TRANSFERVALUE);
        }

        // Skip on contract creation (CREATE or CREATE2)
        if (isContractCreation) return;

        // Skip if caller has SUPER permissions for operations
        if (hasSuperOperation && isCallDataPresent && value == 0) return;

        // Skip if caller has SUPER permission for value transfers
        if (hasSuperTransferValue && !isCallDataPresent && value != 0) return;

        // Skip if both SUPER permissions are present
        if (hasSuperOperation && hasSuperTransferValue) return;

        _verifyAllowedCall(from, payload, target);
    }

    function _verifyAllowedCall(
        address from,
        bytes calldata payload,
        address target
    ) internal view {
        // CHECK for ALLOWED CALLS
        address to = address(bytes20(payload[48:68]));

        bool containsFunctionCall = payload.length >= 168;
        bytes4 selector;
        if (containsFunctionCall) selector = bytes4(payload[164:168]);

        bytes memory allowedCalls = ERC725Y(target).getAllowedCallsFor(from);
        uint256 allowedCallsLength = allowedCalls.length;

        if (allowedCallsLength == 0 || !LSP2Utils.isCompactBytesArray(allowedCalls)) {
            revert NoCallsAllowed(from);
        }

        bool isAllowedStandard;
        bool isAllowedAddress;
        bool isAllowedFunction;

        for (uint256 ii = 0; ii < allowedCallsLength; ii += 29) {
            bytes memory chunk = BytesLib.slice(allowedCalls, ii + 1, 28);

            if (bytes28(chunk) == 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
                revert InvalidWhitelistedCall(from);
            }

            bytes4 allowedStandard = bytes4(chunk);
            address allowedAddress = address(bytes20(bytes28(chunk) << 32));
            bytes4 allowedFunction = bytes4(bytes28(chunk) << 192);

            isAllowedStandard =
                allowedStandard == 0xffffffff ||
                to.supportsERC165Interface(allowedStandard);
            isAllowedAddress =
                allowedAddress == 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF ||
                to == allowedAddress;
            isAllowedFunction =
                allowedFunction == 0xffffffff ||
                (containsFunctionCall && (selector == allowedFunction));

            if (isAllowedStandard && isAllowedAddress && isAllowedFunction) return;
        }

        revert NotAllowedCall(from, to, selector);
    }

    /**
     * @dev extract the required permission + a descriptive string, based on the `_operationType`
     * being run via ERC725Account.execute(...)
     * @param operationType 0 = CALL, 1 = CREATE, 2 = CREATE2, etc... See ERC725X docs for more infos.
     * @return permissionsRequired (bytes32) the permission associated with the `_operationType`
     */
    function _extractPermissionFromOperation(uint256 operationType)
        internal
        pure
        returns (bytes32 permissionsRequired)
    {
        if (operationType == OPERATION_0_CALL) return _PERMISSION_CALL;
        else if (operationType == OPERATION_1_CREATE) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_2_CREATE2) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_3_STATICCALL) return _PERMISSION_STATICCALL;
        else if (operationType == OPERATION_4_DELEGATECALL) return _PERMISSION_DELEGATECALL;
    }

    /**
     * @dev returns the `superPermission` needed for a specific `operationType` of the `execute(..)`
     */
    function _extractSuperPermissionFromOperation(uint256 operationType)
        internal
        pure
        returns (bytes32 superPermission)
    {
        if (operationType == OPERATION_0_CALL) return _PERMISSION_SUPER_CALL;
        else if (operationType == OPERATION_3_STATICCALL) return _PERMISSION_SUPER_STATICCALL;
        else if (operationType == OPERATION_4_DELEGATECALL) return _PERMISSION_SUPER_DELEGATECALL;
    }

    /**
     * @dev revert if `from`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param from the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address from,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal virtual pure {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = permissionRequired.getPermissionName();
            revert NotAuthorised(from, permissionErrorString);
        }
    }
}
