// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev reverts when there is no extension for the function selector being called with
 */
error NoExtensionForFunctionSelector(bytes4 functionSelector);
