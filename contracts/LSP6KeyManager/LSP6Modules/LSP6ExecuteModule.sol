// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {
    _PERMISSION_TRANSFERVALUE,
    _PERMISSION_SUPER_TRANSFERVALUE,
    _PERMISSION_DEPLOY,
    _PERMISSION_CALL,
    _PERMISSION_SUPER_CALL,
    _PERMISSION_STATICCALL,
    _PERMISSION_SUPER_STATICCALL,
    _ALLOWEDCALLS_TRANSFERVALUE,
    _ALLOWEDCALLS_CALL,
    _ALLOWEDCALLS_STATICCALL,
    _ALLOWEDCALLS_DELEGATECALL
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
    CallingKeyManagerNotAllowed
} from "../LSP6Errors.sol";

abstract contract LSP6ExecuteModule {
    using ERC165Checker for address;
    using LSP6Utils for *;

    /**
     * @dev verify if `controllerAddress` has the required permissions to interact with other addresses using the controlledContract.
     * @param controlledContract the address of the ERC725 contract where the payload is executed and where the permissions are verified.
     * @param controller the address who want to run the execute function on the ERC725Account.
     * @param permissions the permissions of the controller address.
     */
    function _verifyCanExecute(
        address controlledContract,
        address controller,
        bytes32 permissions,
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        // if to is the KeyManager address revert
        if (to == address(this)) {
            revert CallingKeyManagerNotAllowed();
        }

        // Future versions of the KeyManager willing to allow LSP0 to call the KeyManager
        // may need to implement this check to avoid inconsistent state of reentrancy
        // that may lead to lock the use of the KeyManager

        // Check to restrict controllers with execute permissions to call lsp20 functions
        // to avoid setting the reentrancy guard to a non-valid state

        // if (data.length >= 4 && to == address(this)) {
        //     if (
        //         bytes4(data) == ILSP20.lsp20VerifyCall.selector ||
        //         bytes4(data) == ILSP20.lsp20VerifyCallResult.selector
        //     ) {
        //         revert CallingLSP20FunctionsOnLSP6NotAllowed();
        //     }
        // }

        // if it is a message call
        if (operationType == OPERATION_0_CALL) {
            return
                _verifyCanCall(
                    controlledContract,
                    controller,
                    permissions,
                    to,
                    value,
                    data
                );
        }

        // if it is a contract creation
        if (
            operationType == OPERATION_1_CREATE ||
            operationType == OPERATION_2_CREATE2
        ) {
            // required to check for permission TRANSFERVALUE if we are funding
            // the contract on deployment via a payable constructor
            bool isFundingContract = value != 0;

            return
                _verifyCanDeployContract(
                    controller,
                    permissions,
                    isFundingContract
                );
        }

        // if it is a STATICALL
        // we do not check for TRANSFERVALUE permission,
        // as ERC725X will revert if a value is provided with operation type STATICCALL.
        if (operationType == OPERATION_3_STATICCALL) {
            return
                _verifyCanStaticCall(
                    controlledContract,
                    controller,
                    permissions,
                    to,
                    value,
                    data
                );
        }

        // DELEGATECALL is disallowed by default on the Key Manager.
        if (operationType == OPERATION_4_DELEGATECALL) {
            revert DelegateCallDisallowedViaKeyManager();
        }
    }

    function _verifyCanDeployContract(
        address controller,
        bytes32 permissions,
        bool isFundingContract
    ) internal view virtual {
        _requirePermissions(controller, permissions, _PERMISSION_DEPLOY);

        bool hasSuperTransferValue = permissions.hasPermission(
            _PERMISSION_SUPER_TRANSFERVALUE
        );

        // CHECK if we are funding the contract
        if (isFundingContract && !hasSuperTransferValue) {
            revert NotAuthorised(controller, "SUPER_TRANSFERVALUE");
        }
    }

    function _verifyCanStaticCall(
        address controlledContract,
        address controller,
        bytes32 permissions,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        bool hasSuperStaticCall = permissions.hasPermission(
            _PERMISSION_SUPER_STATICCALL
        );

        // Skip if caller has SUPER permission for static calls
        if (hasSuperStaticCall) return;

        _requirePermissions(controller, permissions, _PERMISSION_STATICCALL);

        _verifyAllowedCall(
            controlledContract,
            controller,
            OPERATION_3_STATICCALL,
            to,
            value,
            data
        );
    }

    function _verifyCanCall(
        address controlledContract,
        address controller,
        bytes32 permissions,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        bool isValueTransfer = value != 0;

        bool hasSuperTransferValue = permissions.hasPermission(
            _PERMISSION_SUPER_TRANSFERVALUE
        );

        bool isEmptyCall = data.length == 0;

        bool hasSuperCall = permissions.hasPermission(_PERMISSION_SUPER_CALL);

        if (isValueTransfer && !hasSuperTransferValue) {
            _requirePermissions(
                controller,
                permissions,
                _PERMISSION_TRANSFERVALUE
            );
        }

        // CHECK if we are doing an empty call, as the receive() or fallback() function
        // of the controlledContract could run some code.
        if (isEmptyCall && !isValueTransfer && !hasSuperCall) {
            _requirePermissions(controller, permissions, _PERMISSION_CALL);
        }

        if (!isEmptyCall && !hasSuperCall) {
            _requirePermissions(controller, permissions, _PERMISSION_CALL);
        }

        // Skip if caller has SUPER permissions for external calls, with or without calldata (empty calls)
        if (!isValueTransfer && hasSuperCall) return;

        // Skip if caller has SUPER permission for value transfers
        if (isEmptyCall && isValueTransfer && hasSuperTransferValue) return;

        // Skip if both SUPER permissions are present
        if (hasSuperCall && hasSuperTransferValue) return;

        _verifyAllowedCall(
            controlledContract,
            controller,
            OPERATION_0_CALL,
            to,
            value,
            data
        );
    }

    function _verifyAllowedCall(
        address controlledContract,
        address controllerAddress,
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        // CHECK for ALLOWED CALLS
        bytes memory allowedCalls = ERC725Y(controlledContract)
            .getAllowedCallsFor(controllerAddress);

        if (allowedCalls.length == 0) {
            revert NoCallsAllowed(controllerAddress);
        }

        bytes4 requiredCallTypes = _extractCallType(operationType, value, data);

        for (uint256 ii; ii < allowedCalls.length; ii += 34) {
            /// @dev structure of an AllowedCall
            //
            /// AllowedCall = 0x00200000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
            ///
            ///                                     0020 = hex for '32' bytes long
            ///                                 0000000n = call type(s)
            /// cafecafecafecafecafecafecafecafecafecafe = address
            ///                                 5a5a5a5a = standard
            ///                                 f1f1f1f1 = function

            // CHECK that we can extract an AllowedCall
            if (ii + 34 > allowedCalls.length) {
                revert InvalidEncodedAllowedCalls(allowedCalls);
            }

            // extract one AllowedCall at a time
            bytes memory allowedCall = BytesLib.slice(allowedCalls, ii + 2, 32);

            // 0xxxxxxxxxffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            // (excluding the callTypes) not allowed
            // as equivalent to whitelisting any call (= SUPER permission)
            if (
                bytes28(bytes32(allowedCall) << 32) ==
                bytes28(type(uint224).max)
            ) {
                revert InvalidWhitelistedCall(controllerAddress);
            }

            if (
                _isAllowedCallType(allowedCall, requiredCallTypes) &&
                _isAllowedAddress(allowedCall, to) &&
                _isAllowedStandard(allowedCall, to) &&
                _isAllowedFunction(allowedCall, data)
            ) return;
        }

        revert NotAllowedCall(controllerAddress, to, bytes4(data));
    }

    /**
     * @dev extract the bytes4 representation of a single bit for the type of call according to the `operationType`
     * @param operationType 0 = CALL, 3 = STATICCALL or 3 = DELEGATECALL
     * @return requiredCallTypes a bytes4 value containing a single 1 bit for the callType
     */
    function _extractCallType(
        uint256 operationType,
        uint256 value,
        bytes memory data
    ) internal pure returns (bytes4 requiredCallTypes) {
        // if there is value being transferred, add the extra bit
        // for the first bit for Value Transfer in the `requiredCallTypes`
        if (value != 0) {
            requiredCallTypes |= _ALLOWEDCALLS_TRANSFERVALUE;
        }

        bool isCallDataPresent = data.length != 0;
        bool isEmptyCallWithoutValue = !isCallDataPresent && value == 0;

        // if we are doing a message call with some data
        // or if we are doing an empty call without value
        if (isCallDataPresent || isEmptyCallWithoutValue) {
            if (operationType == OPERATION_0_CALL) {
                requiredCallTypes |= _ALLOWEDCALLS_CALL;
            } else if (operationType == OPERATION_3_STATICCALL) {
                requiredCallTypes |= _ALLOWEDCALLS_STATICCALL;
            } else if (operationType == OPERATION_4_DELEGATECALL) {
                requiredCallTypes |= _ALLOWEDCALLS_DELEGATECALL;
            }
        }
    }

    function _isAllowedAddress(
        bytes memory allowedCall,
        address to
    ) internal pure virtual returns (bool) {
        // <offset> = 4 bytes x 8 bits = 32 bits
        //
        // <offset>v----------------address---------------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        address allowedAddress = address(bytes20(bytes32(allowedCall) << 32));

        // ANY address = 0xffffffffffffffffffffffffffffffffffffffff
        return
            allowedAddress == address(bytes20(type(uint160).max)) ||
            to == allowedAddress;
    }

    function _isAllowedStandard(
        bytes memory allowedCall,
        address to
    ) internal view virtual returns (bool) {
        // <offset> = 24 bytes x 8 bits = 192 bits
        //
        //                                                 standard
        // <----------------<offset>---------------------->v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedStandard = bytes4(bytes32(allowedCall) << 192);

        // ANY Standard = 0xffffffff
        return
            allowedStandard == bytes4(type(uint32).max) ||
            to.supportsERC165InterfaceUnchecked(allowedStandard);
    }

    function _isAllowedFunction(
        bytes memory allowedCall,
        bytes memory data
    ) internal pure virtual returns (bool) {
        // <offset> = 28 bytes x 8 bits = 224 bits
        //
        //                                                         function
        // <------------------------<offset>---------------------->v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedFunction = bytes4(bytes32(allowedCall) << 224);

        bool isFunctionCall = data.length >= 4;

        bytes4 requiredFunction = bytes4(data);

        // ANY function = 0xffffffff
        return
            allowedFunction == bytes4(type(uint32).max) ||
            (isFunctionCall && (requiredFunction == allowedFunction));
    }

    function _isAllowedCallType(
        bytes memory allowedCall,
        bytes4 requiredCallTypes
    ) internal pure virtual returns (bool) {
        // extract callType
        //
        // <offset> = 0
        //
        // callType
        // v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedCallType = bytes4(allowedCall);
        return (allowedCallType & requiredCallTypes == requiredCallTypes);
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
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                permissionRequired
            );
            revert NotAuthorised(controller, permissionErrorString);
        }
    }
}
