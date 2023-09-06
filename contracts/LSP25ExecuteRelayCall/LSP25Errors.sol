// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @notice Relay call not valid yet.
 *
 * @dev Reverts when the relay call is cannot yet bet executed.
 * This mean that the starting timestamp provided to {executeRelayCall} function is bigger than the current timestamp.
 */
error RelayCallBeforeStartTime();

/**
 * @notice Relay call expired (deadline passed).
 *
 * @dev Reverts when the period to execute the relay call has expired.
 */
error RelayCallExpired();
