// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/*
 * @dev Casting utility library for ethereum contracts written in Solidity.
 *      The library lets you concatenate, type cast efficiently. // To Test
 */
library UtilsLib {
    // solhint-disable no-inline-assembly

    /**
     * @dev concatenate two bytes16
     */
    function concatTwoBytes16(bytes16 b1, bytes16 b2)
        internal
        pure
        returns (bytes memory result)
    {
        result = bytes.concat(b1, b2);
    }

    /**
     * @dev cast uint256 to bytes
     */
    function uint256ToBytes(uint256 num)
        internal
        pure
        returns (bytes memory bytes_)
    {
        bytes_ = bytes.concat(bytes32(num));
    }

    /**
     * @dev cast address to bytes
     */
    function addressToBytes(address addr)
        internal
        pure
        returns (bytes memory bytes_)
    {
        bytes_ = bytes.concat(bytes20(addr));
    }
}
