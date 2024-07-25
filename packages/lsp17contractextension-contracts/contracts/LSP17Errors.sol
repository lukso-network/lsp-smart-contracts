// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev reverts when there is no extension for the function selector being called with
 */
error NoExtensionFoundForFunctionSelector(bytes4 functionSelector);

/**
 * @dev reverts when the contract is called with a function selector not valid (less than 4 bytes of data)
 */
error InvalidFunctionSelector(bytes data);

/**
 * @dev reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)
 */
error InvalidExtensionAddress(bytes storedData);
