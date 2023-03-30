// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

/**
 * @title GasUtils - A library for optimizing gas usage in Solidity
 */
library GasUtils {
    /**
     * @dev Returns the unchecked incremented value of a given uint256
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
