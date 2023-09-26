// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract & its owner contract.
 * @notice Invalid value sent.
 */
error InvalidValueSum();

/**
 * @dev Reverts when the deployment & intialization of the contract has failed.
 * @notice Failed to deploy & initialize the Primary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & intialization have failed.
 */
error PrimaryContractProxyInitFailureError(bytes errorData);

/**
 * @dev Reverts when the deployment & intialization of the secondary contract has failed.
 * @notice Failed to deploy & initialize the Secondary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & intialization have failed.
 */
error SecondaryContractProxyInitFailureError(bytes errorData);
