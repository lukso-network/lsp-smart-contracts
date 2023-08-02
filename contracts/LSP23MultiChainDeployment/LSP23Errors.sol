// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract and its owner contract.
 */
error InvalidValueSum();

/**
 *
 */
error ControlledContractProxyInitFailureError(bytes errorData);

/**
 *
 */
error OwnerProxyInitFailureError(bytes errorData);
