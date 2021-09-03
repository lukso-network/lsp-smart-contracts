// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract Reentrancy {

    bytes _payload;
    address _target;

    constructor(address _keyManager) public {
        _target = _keyManager;
    }

    function loadPayload(bytes memory _payload) public {
        _payload = _payload;
    }

    fallback() external payable {
        _target.call(_payload);
    }
}