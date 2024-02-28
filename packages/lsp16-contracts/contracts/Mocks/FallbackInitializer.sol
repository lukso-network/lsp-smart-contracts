// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev sample contract used for testing
 */
contract FallbackInitializer {
    address public caller;

    receive() external payable {
        _initialize();
    }

    fallback() external payable {
        _initialize();
    }

    function _initialize() internal {
        caller = msg.sender;
    }
}
