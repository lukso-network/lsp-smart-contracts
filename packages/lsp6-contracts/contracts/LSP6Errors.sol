// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @notice The address `from` does not have any permission set on the contract linked to the Key Manager.
 * @dev Reverts when address `from` does not have any permissions set on the account linked to this Key Manager
 *
 * @param from the address that does not have permissions
 */
error NoPermissionsSet(address from);

/**
 * @notice The address `from` is not authorised to `permission` on the contract linked to the Key Manager.
 * @dev Reverts when address `from` is not authorised and does not have `permission` on the linked {target}
 *
 * @param from address The address that was not authorised.
 * @param permission permission The permission required (_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`)
 */
error NotAuthorised(address from, string permission);

/**
 * @notice The address `from` is not authorised to call the function `selector` on the `to` address.
 * @dev Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of
 * a not allowed callType, address, standard or function.
 *
 * @param from The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.
 * @param to The address of an EOA or contract that `from` tried to call using the linked {target}
 * @param selector If `to` is a contract, the bytes4 selector of the function that `from` is trying to call.
 * If no function is called (_e.g: a native token transfer_), selector = `0x00000000`
 */
error NotAllowedCall(address from, address to, bytes4 selector);

/**
 * @notice The address `from` is not authorised to set the data key `disallowedKey` on the contract linked to the Key Manager.
 * @dev Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked {target}.
 *
 * @param from address The controller that tried to `setData` on the linked {target}.
 * @param disallowedKey A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}.
 */
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);

/**
 * @notice The data key `dataKey` starts with `AddressPermissions` prefix but is none of the permission data keys defined in LSP6.
 * @dev Reverts when `dataKey` is a `bytes32` value that does not adhere to any of the permission data keys defined by the LSP6 standard
 *
 * @param dataKey The dataKey that does not match any of the standard LSP6 permission data keys.
 */
error NotRecognisedPermissionKey(bytes32 dataKey);

/**
 * @notice Invalid address supplied to link this Key Manager to (`address(0)`).
 * @dev Reverts when the address provided to set as the {target} linked to this KeyManager is invalid (_e.g. `address(0)`_).
 */
error InvalidLSP6Target();

/**
 * @notice The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call.
 * Invalid nonce: `invalidNonce`, signature of signer: `signature`.
 *
 * @dev Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.
 *
 * @param signer The address of the signer.
 * @param invalidNonce The nonce retrieved for the `signer` address.
 * @param signature The signature used to retrieve the `signer` address.
 */
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);

/**
 * @notice The Key Manager could not verify the calldata of the transaction because it could not recognise
 * the function being called. Invalid function selector: `invalidFunction`.
 *
 * @dev Reverts when trying to call a function on the linked {target}, that is not any of the following:
 * - `setData(bytes32,bytes)` (ERC725Y)
 * - `setDataBatch(bytes32[],bytes[])` (ERC725Y)
 * - `execute(uint256,address,uint256,bytes)` (ERC725X)
 * - `transferOwnership(address)` (LSP14)
 * - `acceptOwnership()` (LSP14)
 * - `renounceOwnership()` (LSP14)
 *
 * @param invalidFunction The `bytes4` selector of the function that was attempted
 * to be called on the linked {target} but not recognised.
 */
error InvalidERC725Function(bytes4 invalidFunction);

/**
 * @notice Could not decode the Allowed Calls. Value = `allowedCallsValue`.
 *
 * @dev Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`
 * (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.
 *
 * @param allowedCallsValue The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`.
 */
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);

/**
 * @notice The address `from` is not authorised to set data, because it has no ERC725Y Data Key allowed.
 *
 * @dev Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set
 * any ERC725Y data key on the ERC725Y storage of the linked {target}.
 *
 * @param from The address that has no `AllowedERC725YDataKeys` set.
 */
error NoERC725YDataKeysAllowed(address from);

/**
 * @notice The address `from` is not authorised to use the linked account contract to make external calls, because it has no Allowed Calls set.
 *
 * @dev Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked {target}.
 *
 * @param from The address that has no AllowedCalls.
 */
error NoCallsAllowed(address from);

/**
 * @notice Error when reading the Allowed ERC725Y Data Keys. Reason: `context`, Allowed ERC725Y Data Keys value read: `value`.
 *
 * @dev Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context
 * on when this error occurred (_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller,
 * or when validating the `AllowedERC725YDataKeys` when setting them for a controller).
 *
 * @param value The value that is not a valid `bytes32[CompactBytesArray]`
 * @param context A brief description of where the error occurred.
 */
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);

/**
 * @notice Invalid allowed calls (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff`) set for address `from`.
 * Could not perform external call.
 *
 * @dev Reverts when a `from` address has _"any whitelisted call"_ as allowed call set.
 * This revert happens during the verification of the permissions of the address for its allowed calls.
 *
 * A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
 * in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION.
 * This is equivalent to granting the SUPER permission and should never be valid.
 *
 * @param from The controller address that has _"any allowed calls"_ whitelisted set.
 */
error InvalidWhitelistedCall(address from);

/**
 * @notice The array parameters provided to the function `executeRelayCallBatch(...)` do not have the same number of elements.
 * (Different array param's length).
 *
 * @dev Reverts when providing array parameters of different sizes to `executeRelayCallBatch(bytes[],uint256[],bytes[])`
 */
error BatchExecuteRelayCallParamsLengthMismatch();

/**
 * @notice The array parameters provided to the function `executeBatch(...)` do not have the same number of elements.
 * (Different array param's length).
 *
 * @dev Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes.
 * There should be the same number of elements for each array parameters.
 */
error BatchExecuteParamsLengthMismatch();

/**
 * @notice Not enough funds sent to forward each amount in the batch.
 *
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
 * @notice Too much funds sent to forward each amount in the batch. No amount of native tokens should stay in the Key Manager.
 *
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
 * @notice Performing DELEGATE CALLS via the Key Manager is currently disallowed.
 *
 * @dev Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4)
 * function of the linked {target}.
 * `DELEGATECALL` is disallowed by default on the LSP6KeyManager.
 */
error DelegateCallDisallowedViaKeyManager();

/**
 * @notice Invalid calldata payload sent.
 * @dev Reverts when the payload is invalid.
 */
error InvalidPayload(bytes payload);

/**
 * @notice Calling the Key Manager address for this transaction is disallowed.
 *
 * @dev Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.
 */
error CallingKeyManagerNotAllowed();

/**
 * @notice Key Manager cannot be used as an LSP17 extension for LSP20 functions.
 *
 * @dev Reverts when the address of the Key Manager is being set as extensions for lsp20 functions
 */
error KeyManagerCannotBeSetAsExtensionForLSP20Functions();

/**
 * @notice Data value: `dataValue` length is different from the required length for the data key which is set.
 *
 * @dev Reverts when the data value length is not one of the required lengths for the specific data key.
 *
 * @param dataKey The data key that has a required length for the data value.
 * @param dataValue The data value that has an invalid length.
 */
error InvalidDataValuesForDataKeys(bytes32 dataKey, bytes dataValue);
