// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev reverts when `value` is not a properly ABI encoded array
 * @param value the value to check for an abi-encoded array
 * @param valueType the type of the value to check for an abi-encoded array
 */
error InvalidABIEncodedArray(bytes value, string valueType);

/**
 * @dev reverts when `value` is not a properly encoded CompactBytesArray of bytes28 entries.
 * @param value the value to check for a compact fixed size bytes array
 */
error InvalidCompactBytes28Array(bytes value);
