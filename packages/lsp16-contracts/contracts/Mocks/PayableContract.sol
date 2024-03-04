// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev sample contract used for testing
 */
contract PayableContract {
    // solhint-disable no-empty-blocks
    constructor() payable {}

    // solhint-disable no-empty-blocks
    function payableTrue() public payable {}

    // solhint-disable no-empty-blocks
    function payableFalse() public {}
}
