// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

/**
 * @title GasUtils - A library of utility functions to optimize gas usage in Solidity
 */
library GasUtils {
    /**
     * @dev Increment the `i` value by +1 without checking for arithmetic overflow. 
     if `i` is `max(uint256)`, this will not revert and wrap `i` to `0`.
     *      Can be used to save gas when iterating over loops
     * @param i The uint256 value to increment
     * @return incrementedValue The incremented value of the input
     */
    function uncheckedIncrement(uint256 i) internal pure returns (uint256 incrementedValue) {
        unchecked {
            return i + 1;
        }
    }
}
