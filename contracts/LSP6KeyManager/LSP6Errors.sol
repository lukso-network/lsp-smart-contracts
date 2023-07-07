// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when address `from` does not have any permissions set on the account linked to this Key Manager
 *
 * @param from the address that does not have permissions
 */
error NoPermissionsSet(address from);

/**
 * @dev Reverts when address `from` is not authorised and does not have `permission` on the linked {target}
 *
 * @param from address The address that was not authorised.
 * @param permission permission The permission required (_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`)
 */
error NotAuthorised(address from, string permission);

/**
 * @dev Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of
 * a not allowed callType, address, standard or function.
 *
 * @param from address The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.
 * @param to The address of an EOA or contract that `from` tried to call using the linked {target}
 * @param selector If `to` is a contract, the bytes4 selector of the function that `from` is trying to call.
 * If no function is called (e.g: a native token transfer), selector = 0x00000000
 */
error NotAllowedCall(address from, address to, bytes4 selector);

/**
 * @dev Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked {target}.
 *
 * @param from address The controller that tried to `setData` on the linked {target}.
 * @param disallowedKey A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}.
 */
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);

/**
 * @dev Reverts when `dataKey` is a bytes32 value that does not adhere to any of the
 * permission data keys defined by the LSP6 standard
 *
 * @param dataKey The dataKey that does not match any of the standard LSP6 permission data keys.
 */
error NotRecognisedPermissionKey(bytes32 dataKey);

/**
 * @dev Reverts when the address provided to set as the {target} linked to this KeyManager is invalid (_e.g. `address(0)`_).
 */
error InvalidLSP6Target();

/**
 * @dev Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.
 *
 * @param signer The address of the signer
 * @param invalidNonce The nonce retrieved for the `signer` address
 * @param signature The signature used to retrieve the `signer` address
 */
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);

/**
 * @dev Reverts when trying to call a function on the linked {target}, that is not any of the following:
 * - `setData(bytes32,bytes)` (ERC725Y)
 * - `setDataBatch(bytes32[],bytes[])` (ERC725Y)
 * - `execute(uint256,address,uint256,bytes)` (ERC725X)
 * - `transferOwnership(address)`
 * - `acceptOwnership()` (LSP14)
 *
 * @param invalidFunction The `bytes4` selector of the function selector that was attempted
 * to be called on the linked {target} but not recognised.
 */
error InvalidERC725Function(bytes4 invalidFunction);

/**
 * @dev Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`
 * (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.
 *
 * @param allowedCallsValue The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`.
 */
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);

/**
 * @dev Reverts when trying to set a value that is not 20 bytes long (not an `address`) under the `AddressPermissions[index]` data key.
 *
 * @param dataKey The `AddressPermissions[index]` data key, that specify the index in the `AddressPermissions[]` array.
 * @param invalidValue The invalid value that was attempted to be set under `AddressPermissions[index]`.
 */
error AddressPermissionArrayIndexValueNotAnAddress(
    bytes32 dataKey,
    bytes invalidValue
);

/**
 * @dev Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set
 * any ERC725Y data key on the ERC725Y storage of the linked {target}.
 *
 * @param from The address that has no `AllowedERC725YDataKeys` set.
 */
error NoERC725YDataKeysAllowed(address from);

/**
 * @dev Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address
 * using the linked {target}.
 *
 * @param from The address that has no AllowedCalls.
 */
error NoCallsAllowed(address from);

/**
 * @dev Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context
 * on when this error occured (_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller,
 * or when validating the `AllowedERC725YDataKeys` when setting them for a controller).
 *
 * @param value The value that is not a valid `bytes32[CompactBytesArray]`
 * @param context A brief description of where the error occured.
 */
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);

/**
 * @dev Reverts when verifying the permissions of a `from` address for its allowed calls, and has a "any whitelisted call" allowed call set.
 * A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
 * in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION.
 * This is equivalent to granting the SUPER permission and should never be valid.
 *
 * @param from The controller address that has any allowed calls whitelisted set.
 */
error InvalidWhitelistedCall(address from);

/**
 * @dev Reverts when providing array parameters of different sizes to `executeRelayCall(bytes[],uint256[],bytes[])`
 */
error BatchExecuteRelayCallParamsLengthMismatch();

/**
 * @dev Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes.
 * There should be the same number of elements for each array parameters.
 */
error BatchExecuteParamsLengthMismatch();

/**
 * @dev This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or
 * `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on
 * each payloads (`values[]` parameter from the batch functions above).
 *
 * This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).
 *
 * @param totalValues The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).
 * @param msgValue The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`.
 */
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @dev This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or
 * `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on
 *
 * Reverts to avoid the KeyManager to holds some remaining funds sent
 * to the following batch functions:
 *  - execute(uint256[],bytes[])
 *  - executeRelayCall(bytes[],uint256[],uint256[],bytes[])
 *
 * This error occurs when `msg.value` is more than the sum of all the values being
 * forwarded on each payloads (`values[]` parameter from the batch functions above).
 */
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @dev Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4)
 * function of the linked {target}.
 * `DELEGATECALL` is disallowed by default on the LSP6KeyManager.
 */
error DelegateCallDisallowedViaKeyManager();

/**
 * @dev Reverst when the payload is invalid.
 */
error InvalidPayload(bytes payload);

/**
 * @dev Reverts when trying to call to the `setData(byte32,bytes)` or `setData(bytes32[],bytes[]) functions
 * on the linked {target} while sending value.
 */
error CannotSendValueToSetData();

/**
 * @dev Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.
 */
error CallingKeyManagerNotAllowed();

/**
 * @dev Reverts when the start timestamp provided to {executeRelayCall} function is bigger than the current timestamp.
 */
error RelayCallBeforeStartTime();

/**
 * @dev Reverts when the period to execute the relay call has expired.
 */
error RelayCallExpired();

/**
 * @dev reverts when the address of the Key Manager is being set as extensions for lsp20 functions
 */
error KeyManagerCannotBeSetAsExtensionForLSP20Functions();
