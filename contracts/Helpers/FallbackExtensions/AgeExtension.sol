// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev This contract is used only for testing purposes
 */
contract AgeExtension {
    function age() public view virtual returns (uint256) {
        return 20;
    }
}
