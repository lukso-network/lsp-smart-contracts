// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract NoSupportsInterfaceWithFallback {
    fallback() external payable {}
}
