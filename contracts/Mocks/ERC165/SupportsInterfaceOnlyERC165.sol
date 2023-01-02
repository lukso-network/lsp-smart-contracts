// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract SupportsInterfaceOnlyERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == 0x01ffc9a7;
    }
}
