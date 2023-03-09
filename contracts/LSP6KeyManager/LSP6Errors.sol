// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when address `from` does not have any permissions set
 * on the account linked to this Key Manager
 * @param from the address that does not have permissions
 */
error NoPermissionsSet(address from);

/**
 * @dev reverts when address `from` is not authorised to perform `permission` on the linked account
 * @param permission permission required
 * @param from address not-authorised
 */
error NotAuthorised(address from, string permission);

/**
 * @dev reverts when `from` is not authorised to make the call because of a not allowed standard, address or function.
 * @param from address making the request
 * @param to the address of an EOA or contract that `from` is trying to interact with
 * @param selector if `to` is a contract, the bytes4 selector of the function that `from` is trying to call.
 * If no function is called (e.g: a native token transfer), selector = 0x00000000
 */
error NotAllowedCall(address from, address to, bytes4 selector);

/**
 * @dev reverts when address `from` is not authorised to set the key `disallowedKey` on the linked account
 * @param from address making the request
 * @param disallowedKey a bytes32 key that `from` is not authorised to set on the ERC725Y storage
 */
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);

/**
 * @dev reverts when `dataKey` is a bytes32 that does not adhere to any of the
 *      permission data keys specified by the LSP6 standard
 *
 * @param dataKey the dataKey that does not match with any of the standard LSP6 permission data keys
 */
error NotRecognisedPermissionKey(bytes32 dataKey);

/**
 * @dev reverts when the address provided as a target (= account) linked to this KeyManager is invalid
 *      e.g. address(0)
 */
error InvalidLSP6Target();

/**
 * @dev reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.
 * @param signer the address of the signer
 * @param invalidNonce the nonce retrieved for the `signer` address
 * @param signature the signature used to retrieve the `signer` address
 */
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);

/**
 * @dev reverts when trying to run an invalid function on the linked target account via the Key Manager.
 * @param invalidFunction the bytes4 selector of the invalid function
 */
error InvalidERC725Function(bytes4 invalidFunction);

/**
 * @dev reverts when `allowedCallsValue` is not properly encoded as a bytes28[CompactBytesArray]
 * (CompactBytesArray of bytes28 entries). See LSP2 value type `CompactBytesArray` for details.
 * @param allowedCallsValue the list of allowedCalls
 */
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);

/**
 * @dev reverts when trying to set a value that is not 20 bytes long under AddressPermissions[index]
 * @param dataKey the AddressPermissions[index] data key
 * @param invalidValue the invalid value that was attempted to be set under AddressPermissions[index]
 */
error AddressPermissionArrayIndexValueNotAnAddress(bytes32 dataKey, bytes invalidValue);

/**
 * @dev reverts if there are no AllowedERC725YDataKeys set for the caller
 * @param from the address that has no AllowedERC725YDataKeys
 */
error NoERC725YDataKeysAllowed(address from);

/**
 * @dev reverts if there are no allowed calls set for `from`
 * @param from the address that has no AllowedCalls
 */
error NoCallsAllowed(address from);

/**
 * @dev reverts when `value` is not encoded properly using the CompactBytesArray
 * @param value the value to check for an CompactBytesArray
 */
error InvalidEncodedAllowedERC725YDataKeys(bytes value);

/**
 * @dev reverts when `value` contains an element of length superior to 32 bytes
 * @param value the value to check for an CompactBytesArray
 */
error AllowedERC725YDataKeysContainsElementBiggerThan32Bytes(bytes value);

/**
 * @dev a `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
 * in its list of AddressPermissions:AllowedCalls:<address>, as this allows any STANDARD:ADDRESS:FUNCTION.
 * This is equivalent to granting the SUPER permission and should never be valid.
 *
 * @param from the address that has any allowed calls whitelisted.
 */
error InvalidWhitelistedCall(address from);

/**
 * @dev reverts when providing array parameters of different sizes to `executeRelayCall(bytes[],uint256[],bytes[])`
 */
error BatchExecuteRelayCallParamsLengthMismatch();

/**
 * @dev there should be the same number of elements for each array parameters
 * in the following batch functions:
 *  - execute(uint256[],bytes[])
 *  - executeRelayCall(bytes[],uint256[],uint256[],bytes[])
 */
error BatchExecuteParamsLengthMismatch();

/**
 * @dev the `msg.value` sent is not enough to cover the sum of all the values being
 * forwarded on each payloads (`values[]` parameter) in the following batch functions:
 *  - execute(uint256[],bytes[])
 *  - executeRelayCall(bytes[],uint256[],uint256[],bytes[])
 */
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @dev reverts to avoid the KeyManager to holds some remaining funds sent
 * to the following batch functions:
 *  - execute(uint256[],bytes[])
 *  - executeRelayCall(bytes[],uint256[],uint256[],bytes[])
 *
 * This error occurs when `msg.value` is more than the sum of all the values being
 * forwarded on each payloads (`values[]` parameter from the batch functions above).
 */
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @dev ERC725X operation type 4 (DELEGATECALL) is disallowed by default
 */
error DelegateCallDisallowedViaKeyManager();

/**
 * @dev reverts when the payload is invalid.
 */
error InvalidPayload(bytes payload);
