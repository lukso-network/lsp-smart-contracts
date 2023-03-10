// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {
    _PERMISSION_TRANSFERVALUE,
    _PERMISSION_SUPER_TRANSFERVALUE,
    _PERMISSION_DEPLOY,
    _PERMISSION_CALL,
    _PERMISSION_SUPER_CALL,
    _PERMISSION_STATICCALL,
    _PERMISSION_SUPER_STATICCALL,
    _PERMISSION_DELEGATECALL,
    _PERMISSION_SUPER_DELEGATECALL
} from "../LSP6Constants.sol";
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";

// errors
import {
    DelegateCallDisallowedViaKeyManager,
    NoCallsAllowed,
    NotAllowedCall,
    InvalidEncodedAllowedCalls,
    InvalidWhitelistedCall,
    NotAuthorised,
    InvalidPayload
} from "../LSP6Errors.sol";

abstract contract LSP6ExecuteModule {
    using ERC165Checker for address;
    using LSP6Utils for *;

    /**
     * @dev verify if `controllerAddress` has the required permissions to interact with other addresses using the controlledContract.
     * @param controlledContract the address of the ERC725 contract where the payload is executed and where the permissions are verified.
     * @param controllerAddress the address who want to run the execute function on the ERC725Account.
     * @param controllerPermissions the permissions of the controller address.
     * @param payload the ABI encoded payload `controlledContract.execute(...)`.
     */
    function _verifyCanExecute(
        address controlledContract,
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes calldata payload
    ) internal view virtual {
        // MUST be one of the ERC725X operation types.
        uint256 operationType = uint256(bytes32(payload[4:36]));

        // DELEGATECALL is disallowed by default on the LSP6 Key Manager.
        if (operationType == OPERATION_4_DELEGATECALL) {
            revert DelegateCallDisallowedViaKeyManager();
        }

        uint256 value = uint256(bytes32(payload[68:100]));

        bool hasSuperTransferValue = controllerPermissions.hasPermission(
            _PERMISSION_SUPER_TRANSFERVALUE
        );

        if (value != 0 && !hasSuperTransferValue) {
            _requirePermissions(
                controllerAddress,
                controllerPermissions,
                _PERMISSION_TRANSFERVALUE
            );
        }

        // CHECK the offset of `data` is not pointing to the previous parameters
        if (
            bytes32(payload[100:132]) !=
            0x0000000000000000000000000000000000000000000000000000000000000080
        ) {
            revert InvalidPayload(payload);
        }

        // if it is a contract creation
        if (operationType == OPERATION_1_CREATE || operationType == OPERATION_2_CREATE2) {
            _requirePermissions(controllerAddress, controllerPermissions, _PERMISSION_DEPLOY);
            return;
        }

        // if it is a message call
        bytes32 executePermission;
        bytes32 superOperationPermission;

        if (operationType == OPERATION_0_CALL) {
            // prettier-ignore
            (executePermission, superOperationPermission) = (_PERMISSION_CALL, _PERMISSION_SUPER_CALL);
        }

        if (operationType == OPERATION_3_STATICCALL) {
            // prettier-ignore
            (executePermission, superOperationPermission) = (_PERMISSION_STATICCALL, _PERMISSION_SUPER_STATICCALL);
        }

        // NB: all the parameters are abi-encoded (padded to 32 bytes words)
        //
        //    4 (ERC725X.execute selector)
        // + 32 (uint256 operationType)
        // + 32 (address to/target)
        // + 32 (uint256 value)
        // + 32 (`data` offset)
        // + 32 (`data` length)
        // --------------------
        // = 164 bytes in total
        bool isCallDataPresent = payload.length > 164;

        bool hasSuperOperation = controllerPermissions.hasPermission(superOperationPermission);

        // CHECK if we are doing an empty call, as the receive() or fallback() function
        // of the controlledContract could run some code.
        if (!hasSuperOperation && !isCallDataPresent && value == 0) {
            _requirePermissions(controllerAddress, controllerPermissions, executePermission);
        }

        if (isCallDataPresent && !hasSuperOperation) {
            _requirePermissions(controllerAddress, controllerPermissions, executePermission);
        }

        // Skip if caller has SUPER permissions for external calls, with or without calldata (empty calls)
        if (hasSuperOperation && value == 0) return;

        // Skip if caller has SUPER permission for value transfers
        if (hasSuperTransferValue && !isCallDataPresent && value != 0) return;

        // Skip if both SUPER permissions are present
        if (hasSuperOperation && hasSuperTransferValue) return;

        _verifyAllowedCall(controlledContract, controllerAddress, payload);
    }

    function _verifyAllowedCall(
        address controlledContract,
        address controllerAddress,
        bytes calldata payload
    ) internal view virtual {
        // CHECK for ALLOWED CALLS
        address to = address(bytes20(payload[48:68]));

        bool containsFunctionCall = payload.length >= 168;
        bytes4 selector;
        if (containsFunctionCall) selector = bytes4(payload[164:168]);

        bytes memory allowedCalls = ERC725Y(controlledContract).getAllowedCallsFor(
            controllerAddress
        );
        uint256 allowedCallsLength = allowedCalls.length;

        if (allowedCallsLength == 0) {
            revert NoCallsAllowed(controllerAddress);
        }

        bool isAllowedStandard;
        bool isAllowedAddress;
        bool isAllowedFunction;

        for (uint256 ii; ii < allowedCallsLength; ii += 30) {
            if (ii + 30 > allowedCallsLength) {
                revert InvalidEncodedAllowedCalls(allowedCalls);
            }
            bytes memory chunk = BytesLib.slice(allowedCalls, ii + 2, 28);

            if (bytes28(chunk) == 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
                revert InvalidWhitelistedCall(controllerAddress);
            }

            bytes4 allowedStandard = bytes4(chunk);
            address allowedAddress = address(bytes20(bytes28(chunk) << 32));
            bytes4 allowedFunction = bytes4(bytes28(chunk) << 192);

            isAllowedStandard =
                allowedStandard == 0xffffffff ||
                to.supportsERC165InterfaceUnchecked(allowedStandard);
            isAllowedAddress =
                allowedAddress == 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF ||
                to == allowedAddress;
            isAllowedFunction =
                allowedFunction == 0xffffffff ||
                (containsFunctionCall && (selector == allowedFunction));

            if (isAllowedStandard && isAllowedAddress && isAllowedFunction) return;
        }

        revert NotAllowedCall(controllerAddress, to, selector);
    }

    /**
     * @dev revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure virtual {
        if (!LSP6Utils.hasPermission(addressPermissions, permissionRequired)) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(permissionRequired);
            revert NotAuthorised(controller, permissionErrorString);
        }
    }
}
