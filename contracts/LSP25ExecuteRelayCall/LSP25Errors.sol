// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.
 *
 * @param signer The address of the signer
 * @param invalidNonce The nonce retrieved for the `signer` address
 * @param signature The signature used to retrieve the `signer` address
 */
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);

/**
 * @dev Reverts when the start timestamp provided to {executeRelayCall} function is bigger than the current timestamp.
 */
error RelayCallBeforeStartTime();

/**
 * @dev Reverts when the period to execute the relay call has expired.
 */
error RelayCallExpired();
