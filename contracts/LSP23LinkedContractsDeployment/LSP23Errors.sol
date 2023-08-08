// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract & its owner contract.
 * @notice Invalid value sent.
 */
error InvalidValueSum();

/**
 * @dev Reverts when the deployment & intialisation of the contract has failed.
 * @notice Failed to deploy & initialise the Primary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & intialisation have failed.
 */
error PrimaryContractProxyInitFailureError(bytes errorData);

/**
 * @dev Reverts when the deployment & intialisation of the secondary contract has failed.
 * @notice Failed to deploy & initialise the Secondary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & intialisation have failed.
 */
error SecondaryContractProxyInitFailureError(bytes errorData);
