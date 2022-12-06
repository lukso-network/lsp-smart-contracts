// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SupportsInterfaceRevert {
    function supportsInterface(
        bytes4 /*interfaceId*/
    ) public view virtual returns (bool) {
        // solhint-disable
        revert();
    }
}
