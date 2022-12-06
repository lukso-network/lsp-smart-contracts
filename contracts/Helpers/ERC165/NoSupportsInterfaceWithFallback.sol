// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract NoSupportsInterfaceWithFallback {
    // solhint-disable
    fallback() external payable {}
}
