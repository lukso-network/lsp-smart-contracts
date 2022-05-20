// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev sample contract used for testing
 */
contract PayableContract {
    constructor() payable {}

    function PayableTrue() public payable {}

    function PayableFalse() public {}
}
