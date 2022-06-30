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
 * @dev reverts when the address provided as a target (= account) linked to this KeyManager is invalid
 *      e.g. address(0)
 */
error InvalidLSP6Target();
