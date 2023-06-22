// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

contract ABIEncoder {
    function encode(
        bytes memory a,
        bytes memory b
    ) public view returns (bytes memory c, uint256 gasUsed) {
        uint256 gasUsed1 = gasleft();
        c = abi.encode(a, b);
        uint256 gasUsed2 = gasleft();
        gasUsed = gasUsed1 - gasUsed2;
    }

    function decode(
        bytes memory c
    ) public pure returns (bytes memory a, bytes memory b) {
        (a, b) = abi.decode(c, (bytes, bytes));
    }
}
