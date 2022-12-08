// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract SupportsInterfaceRevert {
    function supportsInterface(
        bytes4 /*interfaceId*/
    ) public view virtual returns (bool) {
        // solhint-disable-next-line reason-string
        revert();
    }
}
