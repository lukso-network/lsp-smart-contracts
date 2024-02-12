// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager as ILSP6} from "./ILSP6KeyManager.sol";
import {
    ILSP20CallVerifier as ILSP20
} from "@lukso/lsp20-contracts/contracts/ILSP20CallVerifier.sol";
import {
    ILSP25ExecuteRelayCall as ILSP25
} from "@lukso/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol";

// modules
import {
    ILSP14Ownable2Step
} from "@lukso/lsp14-contracts/contracts/ILSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {LSP6SetDataModule} from "./LSP6Modules/LSP6SetDataModule.sol";
import {LSP6ExecuteModule} from "./LSP6Modules/LSP6ExecuteModule.sol";
import {
    LSP6ExecuteRelayCallModule
} from "./LSP6Modules/LSP6ExecuteRelayCallModule.sol";
import {LSP6OwnershipModule} from "./LSP6Modules/LSP6OwnershipModule.sol";
import {
    LSP25MultiChannelNonce
} from "@lukso/lsp25-contracts/contracts/LSP25MultiChannelNonce.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP6Utils} from "./LSP6Utils.sol";

// errors
import {
    ERC725X_ExecuteParametersLengthMismatch,
    ERC725X_ExecuteParametersEmptyArray
} from "@erc725/smart-contracts/contracts/errors.sol";
import {
    BatchExecuteParamsLengthMismatch,
    BatchExecuteRelayCallParamsLengthMismatch,
    LSP6BatchExcessiveValueSent,
    LSP6BatchInsufficientValueSent,
    InvalidPayload,
    InvalidRelayNonce,
    NoPermissionsSet,
    InvalidERC725Function
} from "./LSP6Errors.sol";

import {
    _INTERFACEID_ERC1271,
    _ERC1271_SUCCESSVALUE,
    _ERC1271_FAILVALUE
} from "./constants.sol";
import {
    _INTERFACEID_LSP6,
    _PERMISSION_SIGN,
    _PERMISSION_REENTRANCY
} from "./LSP6Constants.sol";
import {
    _INTERFACEID_LSP20_CALL_VERIFIER,
    _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION,
    _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION,
    _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE
} from "@lukso/lsp20-contracts/contracts/LSP20Constants.sol";
import {
    _INTERFACEID_LSP25
} from "@lukso/lsp25-contracts/contracts/LSP25Constants.sol";

/**
 * @title Core implementation of the LSP6 Key Manager standard.
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev This contract acts as a controller for an ERC725 Account.
 *      Permissions for controllers are stored in the ERC725Y storage of the ERC725 Account and can be updated using `setData(...)`.
 *
 * @custom:danger Because of its potential malicious impact on the linked contract, the current implementation of the Key Manager
 * disallows the operation type **[DELEGATECALL](../universal-profile/lsp6-key-manager.md#permissions-value)** operation via the
 * `execute(...)` function of the linked contract.
 */
abstract contract LSP6KeyManagerCore is
    ERC165,
    IERC1271,
    ILSP6,
    ILSP20,
    ILSP25,
    LSP6SetDataModule,
    LSP6ExecuteModule,
    LSP6ExecuteRelayCallModule,
    LSP6OwnershipModule,
    LSP25MultiChannelNonce
{
    using LSP6Utils for *;
    using ECDSA for *;
    using BytesLib for bytes;

    address internal _target;

    mapping(address => bool) internal _reentrancyStatus;

    /**
     * @inheritdoc ILSP6
     */
    function target() public view override returns (address) {
        return _target;
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP6 ||
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFIER ||
            interfaceId == _INTERFACEID_LSP25 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP25
     *
     * @custom:hint A signer can choose its channel number arbitrarily. The recommended practice is to:
     * - use `channelId == 0` for transactions for which the ordering of execution matters.abi
     *
     * _Example: you have two transactions A and B, and transaction A must be executed first and complete successfully before
     * transaction B should be executed)._
     *
     * - use any other `channelId` number for transactions that you want to be order independant (out-of-order execution, execution _"in parallel"_).
     *
     * _Example: you have two transactions A and B. You want transaction B to be executed a) without having to wait for transaction A to complete,
     * or b) regardless if transaction A completed successfully or not.
     */
    function getNonce(
        address from,
        uint128 channelId
    ) public view virtual override returns (uint256) {
        return LSP25MultiChannelNonce._getNonce(from, channelId);
    }

    /**
     * @inheritdoc IERC1271
     *
     * @dev Checks if a signature was signed by a controller that has the permission `SIGN`.
     * If the signer is a controller with the permission `SIGN`, it will return the ERC1271 success value.
     *
     * @return returnedStatus `0x1626ba7e` on success, or `0xffffffff` on failure.
     *
     * @custom:warning This function does not enforce by default the inclusion of the address of this contract in the signature digest.
     * It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign.
     * To ensure that a signature is valid for a specific LSP6KeyManager and prevent signatures from the same EOA to be replayed
     * across different LSP6KeyManager.
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual override returns (bytes4 returnedStatus) {
        // if isValidSignature fail, the error is catched in returnedError
        (address recoveredAddress, ECDSA.RecoverError returnedError) = ECDSA
            .tryRecover(dataHash, signature);

        // if recovering throws an error, return the fail value
        if (returnedError != ECDSA.RecoverError.NoError)
            return _ERC1271_FAILVALUE;

        // if the address recovered has SIGN permission return the ERC1271 success value, otherwise the fail value
        return (
            ERC725Y(_target).getPermissionsFor(recoveredAddress).hasPermission(
                _PERMISSION_SIGN
            )
                ? _ERC1271_SUCCESSVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6
     *
     * @custom:events {PermissionsVerified} event when the permissions related to `payload` have been verified successfully.
     */
    function execute(
        bytes calldata payload
    ) public payable virtual override returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6
     *
     * @custom:events {PermissionsVerified} event for each permissions related to each `payload` that have been verified successfully.
     */
    function executeBatch(
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual override returns (bytes[] memory) {
        if (values.length != payloads.length) {
            revert BatchExecuteParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _execute(values[ii], payloads[ii]);

            unchecked {
                ++ii;
            }
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP25
     *
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer.
     * The signature MUST be generated according to the signature format defined by the LSP25 standard.
     *
     * The signer that generated the `signature` MUST be a controller with some permissions on the linked {target}.
     * The `payload` will be executed on the {target} contract once the LSP25 signature and the permissions of the signer have been verified.
     *
     * @custom:events {PermissionsVerified} event when the permissions related to `payload` have been verified successfully.
     *
     * @custom:hint If you are looking to learn how to sign and execute relay transactions via the Key Manager,
     * see our Javascript step by step guide [_"Execute Relay Transactions"_](../../../learn/expert-guides/key-manager/execute-relay-transactions.md).
     * See the LSP6 Standard page for more details on how to
     * [generate a valid signature for Execute Relay Call](../../../standards/universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes calldata payload
    ) public payable virtual override returns (bytes memory) {
        return
            _executeRelayCall(
                signature,
                nonce,
                validityTimestamps,
                msg.value,
                payload
            );
    }

    /**
     * @inheritdoc ILSP25
     *
     * @dev Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.
     *
     * The `signatures` can be from multiple controllers, not necessarely the same controller, as long as each of these controllers
     * that signed have the right permissions related to the calldata `payload` they signed.
     *
     * @custom:requirements
     * - the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same.
     * - the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch.
     * There should not be any excess value sent to this function.
     */
    function executeRelayCallBatch(
        bytes[] memory signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual override returns (bytes[] memory) {
        if (
            signatures.length != nonces.length ||
            nonces.length != validityTimestamps.length ||
            validityTimestamps.length != values.length ||
            values.length != payloads.length
        ) {
            revert BatchExecuteRelayCallParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _executeRelayCall(
                signatures[ii],
                nonces[ii],
                validityTimestamps[ii],
                values[ii],
                payloads[ii]
            );

            unchecked {
                ++ii;
            }
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP20
     *
     * @custom:hint This function can call by any other address than the {`target`}.
     * This allows to verify permissions in a _"read-only"_ manner.
     *
     * Anyone can call this function to verify if the `caller` has the right permissions to perform the abi-encoded function call `data`
     * on the {`target`} contract (while sending `msgValue` alongside the call).
     *
     * If the permissions have been verified successfully and `caller` is authorized, one of the following two LSP20 success value will be returned:
     *  - `0x1a238000`: LSP20 success value **without** post verification (last byte is `0x00`).
     *  - `0x1a238001`: LSP20 success value **with** post-verification (last byte is `0x01`).
     */
    function lsp20VerifyCall(
        address /* requestor */,
        address targetContract,
        address caller,
        uint256 msgValue,
        bytes calldata callData
    ) external virtual override returns (bytes4) {
        bool isSetData = bytes4(callData) == IERC725Y.setData.selector ||
            bytes4(callData) == IERC725Y.setDataBatch.selector;

        // If target is invoking the verification, emit the event and change the reentrancy guard
        if (msg.sender == targetContract) {
            bool reentrancyStatus = _nonReentrantBefore(
                targetContract,
                isSetData,
                caller
            );

            _verifyPermissions(targetContract, caller, false, callData);

            emit PermissionsVerified(caller, msgValue, bytes4(callData));

            // if it's a setData call, do not invoke the `lsp20VerifyCallResult(..)` function
            return
                isSetData || reentrancyStatus
                    ? _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION
                    : _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION;
        }
        /// @dev If a different address is invoking the verification,
        /// do not change the state or emit the event to allow read-only verification
        else {
            bool reentrancyStatus = _reentrancyStatus[targetContract];

            if (reentrancyStatus) {
                _requirePermissions(
                    caller,
                    ERC725Y(targetContract).getPermissionsFor(caller),
                    _PERMISSION_REENTRANCY
                );
            }

            _verifyPermissions(targetContract, caller, false, callData);

            // if it's a setData call, do not invoke the `lsp20VerifyCallResult(..)` function
            return
                isSetData || reentrancyStatus
                    ? _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION
                    : _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION;
        }
    }

    /**
     * @inheritdoc ILSP20
     */
    function lsp20VerifyCallResult(
        bytes32 /* callHash */,
        bytes memory /* callResult */
    ) external virtual override returns (bytes4) {
        // If it's the target calling, set back the reentrancy guard
        // to false, if not return the success value
        if (msg.sender == _target) {
            _nonReentrantAfter(msg.sender);
        }
        return _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE;
    }

    function _execute(
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        bool isSetData = bytes4(payload) == IERC725Y.setData.selector ||
            bytes4(payload) == IERC725Y.setDataBatch.selector;

        address targetContract = _target;

        bool reentrancyStatus = _nonReentrantBefore(
            targetContract,
            isSetData,
            msg.sender
        );

        _verifyPermissions(targetContract, msg.sender, false, payload);

        emit PermissionsVerified(msg.sender, msgValue, bytes4(payload));

        bytes memory result = _executePayload(
            targetContract,
            msgValue,
            payload
        );

        if (!reentrancyStatus && !isSetData) {
            _nonReentrantAfter(targetContract);
        }

        return result;
    }

    /**
     * @dev Validate that the `nonce` given for the `signature` signed and the `payload` to execute is valid
     * and conform to the signature format according to the LSP25 standard.
     *
     * @param signature A valid signature for a signer, generated according to the signature format specified in the LSP25 standard.
     * @param nonce The nonce that the signer used to generate the `signature`.
     * @param validityTimestamps Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed,
     * and the right-most `uint128` represents the timestamp after which the transaction expire.
     * @param payload The abi-encoded function call to execute.
     *
     * @custom:warning Be aware that this function can also throw an error if the `callData` was signed incorrectly (not conforming to the signature format defined in the LSP25 standard).
     * This is because the contract cannot distinguish if the data is signed correctly or not. Instead, it will recover an incorrect signer address from the signature
     * and throw an {InvalidRelayNonce} error with the incorrect signer address as the first parameter.
     */
    function _executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        address targetContract = _target;

        address signer = LSP25MultiChannelNonce
            ._recoverSignerFromLSP25Signature(
                signature,
                nonce,
                validityTimestamps,
                msgValue,
                payload
            );

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        LSP25MultiChannelNonce._verifyValidityTimestamps(validityTimestamps);

        bool isSetData = bytes4(payload) == IERC725Y.setData.selector ||
            bytes4(payload) == IERC725Y.setDataBatch.selector;

        bool reentrancyStatus = _nonReentrantBefore(
            targetContract,
            isSetData,
            signer
        );

        _verifyPermissions(targetContract, signer, true, payload);

        emit PermissionsVerified(signer, msgValue, bytes4(payload));

        bytes memory result = _executePayload(
            targetContract,
            msgValue,
            payload
        );

        if (!reentrancyStatus && !isSetData) {
            _nonReentrantAfter(targetContract);
        }

        return result;
    }

    /**
     * @notice Execute the `payload` passed to `execute(...)` or `executeRelayCall(...)`
     * @param payload The abi-encoded function call to execute on the {target} contract.
     * @return bytes The data returned by the call made to the linked {target} contract.
     */
    function _executePayload(
        address targetContract,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        (bool success, bytes memory returnData) = targetContract.call{
            value: msgValue,
            gas: gasleft()
        }(payload);

        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: failed executing payload"
        );

        return result;
    }

    /**
     * @dev Verify if the `from` address is allowed to execute the `payload` on the {target} contract linked to this Key Manager.
     * @param targetContract The contract that is owned by the Key Manager
     * @param from Either the caller of {execute} or the signer of {executeRelayCall}.
     * @param payload The abi-encoded function call to execute on the {target} contract.
     */
    function _verifyPermissions(
        address targetContract,
        address from,
        bool isRelayedCall,
        bytes calldata payload
    ) internal view virtual {
        bytes32 permissions = ERC725Y(targetContract).getPermissionsFor(from);
        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        if (isRelayedCall) {
            LSP6ExecuteRelayCallModule._verifyExecuteRelayCallPermission(
                from,
                permissions
            );
        }

        bytes4 erc725Function = bytes4(payload);

        // ERC725Y.setData(bytes32,bytes)
        if (erc725Function == IERC725Y.setData.selector) {
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(
                payload[4:],
                (bytes32, bytes)
            );

            LSP6SetDataModule._verifyCanSetData(
                targetContract,
                from,
                permissions,
                inputKey,
                inputValue
            );

            // ERC725Y.setDataBatch(bytes32[],bytes[])
        } else if (erc725Function == IERC725Y.setDataBatch.selector) {
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi
                .decode(payload[4:], (bytes32[], bytes[]));

            LSP6SetDataModule._verifyCanSetData(
                targetContract,
                from,
                permissions,
                inputKeys,
                inputValues
            );

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == IERC725X.execute.selector) {
            (
                uint256 operationType,
                address to,
                uint256 value,
                bytes memory callData
            ) = abi.decode(payload[4:], (uint256, address, uint256, bytes));

            LSP6ExecuteModule._verifyCanExecute(
                targetContract,
                from,
                permissions,
                operationType,
                to,
                value,
                callData
            );
        } else if (erc725Function == IERC725X.executeBatch.selector) {
            (
                uint256[] memory operationTypes,
                address[] memory targets,
                uint256[] memory values,
                bytes[] memory callDatas
            ) = abi.decode(
                    payload[4:],
                    (uint256[], address[], uint256[], bytes[])
                );

            if (
                operationTypes.length != targets.length ||
                targets.length != values.length ||
                values.length != callDatas.length
            ) {
                revert ERC725X_ExecuteParametersLengthMismatch();
            }

            if (operationTypes.length == 0) {
                revert ERC725X_ExecuteParametersEmptyArray();
            }

            for (uint256 ii; ii < operationTypes.length; ii++) {
                LSP6ExecuteModule._verifyCanExecute(
                    targetContract,
                    from,
                    permissions,
                    operationTypes[ii],
                    targets[ii],
                    values[ii],
                    callDatas[ii]
                );
            }
        } else if (
            erc725Function == ILSP14Ownable2Step.transferOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.acceptOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.renounceOwnership.selector
        ) {
            LSP6OwnershipModule._verifyOwnershipPermissions(from, permissions);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    /**
     * @dev Check if we are in the context of a reentrant call, by checking if the reentrancy status is `true`.
     * - If the status is `true`, the caller (or signer for relay call) MUST have the `REENTRANCY` permission. Otherwise, the call is reverted.
     * - If the status is `false`, it is set to `true` only if we are not dealing with a call to the functions `setData` or `setDataBatch`.
     * Used at the beginning of the {`lsp20VerifyCall`}, {`_execute`} and {`_executeRelayCall`} functions, before the methods execution starts.
     *
     */
    function _nonReentrantBefore(
        address targetContract,
        bool isSetData,
        address from
    ) internal virtual returns (bool reentrancyStatus) {
        reentrancyStatus = _reentrancyStatus[targetContract];

        if (reentrancyStatus) {
            // CHECK the caller has REENTRANCY permission
            _requirePermissions(
                from,
                ERC725Y(targetContract).getPermissionsFor(from),
                _PERMISSION_REENTRANCY
            );
        } else {
            if (!isSetData) {
                _reentrancyStatus[targetContract] = true;
            }
        }
    }

    /**
     * @dev Resets the reentrancy status to `false`
     * Used at the end of the {`lsp20VerifyCall`}, {`_execute`} and {`_executeRelayCall`} functions after the functions' execution is terminated.
     */
    function _nonReentrantAfter(address targetContract) internal virtual {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus[targetContract] = false;
    }

    /**
     * @dev Check if the `controller` has the `permissionRequired` among its permission listed in `controllerPermissions`
     * If not, this function will revert with the error `NotAuthorised` and the name of the permission missing by the controller.
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure override(LSP6ExecuteModule, LSP6SetDataModule) {
        LSP6ExecuteModule._requirePermissions(
            controller,
            addressPermissions,
            permissionRequired
        );
    }
}
