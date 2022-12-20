// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev sample contract used for testing
 */
contract PayableContract {
    constructor() payable {}

    function payableTrue() public payable {}

    function payableFalse() public {}
}
