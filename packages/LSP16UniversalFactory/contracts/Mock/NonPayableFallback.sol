// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract NonPayableFallback {
    // solhint-disable-next-line payable-fallback
    fallback() external {}
}
