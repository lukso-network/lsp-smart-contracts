// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

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
 * @dev reverts when address `from` is not authorised to interact with `disallowedAddress` via the linked account
 * @param from address making the request
 * @param disallowedAddress address that `from` is not authorised to call
 */
error NotAllowedAddress(address from, address disallowedAddress);

/**
 * @dev reverts when address `from` is restricted to interact only with smart contracts implementing specific standard interface(s)
 *      and try to call an address `addressNotImplementingAllowedStandard` that does not implement one of this restricted standard interfaces.
 * @param from address making the request
 * @param addressNotImplementingAllowedStandard the address of the smart contract that `from` is trying to interact with,
 *                                              and that does not implement an allowed interface.
 */
error NotAllowedStandard(address from, address addressNotImplementingAllowedStandard);

/**
 * @dev reverts when address `from` is not authorised to run `disallowedFunction` via the linked account
 * @param from address making the request
 * @param disallowedFunction bytes4 function selector that `from` is not authorised to run
 */
error NotAllowedFunction(address from, bytes4 disallowedFunction);

/**
 * @dev reverts when address `from` is not authorised to set the key `disallowedKey` on the linked account
 * @param from address making the request
 * @param disallowedKey a bytes32 key that `from` is not authorised to set on the ERC725Y storage
 */
error NotAllowedERC725YKey(address from, bytes32 disallowedKey);

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
 * @dev reverts when trying to set a value that is not 20 bytes long under AddressPermissions[index]
 * @param dataKey the AddressPermissions[index] data key
 * @param invalidValue the invalid value that was attempted to be set under AddressPermissions[index]
 */
error AddressPermissionArrayIndexValueNotAnAddress(bytes32 dataKey, bytes invalidValue);

/**
 * @dev reverts if there are no AllowedERC725YDataKeys set for the caller
 */
error NoERC725YDataKeysAllowed();

/**
 * @dev reverts when `value` is not encoded properly using the CompactBytesArray
 * @param value the value to check for an CompactBytesArray
 */
error InvalidEncodedAllowedERC725YKeys(bytes value);
