// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title LSP17 Utility library to check an extension
 */
library LSP17Utils {
    /**
     * @dev Returns whether the call is a normal call or an extension call by checking if
     * the `parametersLengthWithOffset` with an additional of 52 bytes supposed msg.sender
     * and msg.value appended is equal to the msgDataLength
     */
    function isExtension(
        uint256 parametersLengthWithOffset,
        uint256 msgDataLength
    ) internal pure returns (bool) {
        return (parametersLengthWithOffset + 52) == msgDataLength;
    }
}
