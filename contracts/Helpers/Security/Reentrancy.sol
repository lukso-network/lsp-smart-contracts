// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/* solhint-disable */
contract Reentrancy {
    bytes _payload;
    address _target;

    constructor(address _keyManager) {
        _target = _keyManager;
    }

    function loadPayload(bytes memory _dataPayload) public {
        _payload = _dataPayload;
    }

    fallback() external payable {
        _target.call(_payload);
    }
}
/* solhint-enable */
