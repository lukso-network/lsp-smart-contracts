// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract NameExtension {
    function name() public view virtual returns (string memory) {
        return "LUKSO";
    }
}
