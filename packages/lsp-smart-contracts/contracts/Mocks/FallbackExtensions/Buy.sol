// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract BuyExtension {
    function buy() public payable returns (uint256) {
        return address(this).balance;
    }
}
