// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract FallbackRevert {
    fallback() external payable {
        revert("fallback reverted");
    }
}
