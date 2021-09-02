// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract Reentrancy {

    bytes payload;
    address target;

    constructor(address _keyManager) public {
        target = _keyManager;
    }

    function loadPayload(bytes memory _payload) public {
        payload = _payload;
    }

    fallback() external payable {
        target.call(payload);
    }
}