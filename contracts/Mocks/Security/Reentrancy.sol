// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract Reentrancy {
    bytes private _payload;
    address private _target;

    bool private _switchFallback;

    constructor(address _keyManager) {
        _target = _keyManager;
    }

    function loadPayload(bytes memory _dataPayload) public {
        _payload = _dataPayload;
    }

    receive() external payable {
        if (!_switchFallback) {
            _switchFallback = true;

            (bool success, bytes memory returnData) = _target.call(_payload);
            Address.verifyCallResult(
                success,
                returnData,
                "Reentrancy Helper Contract: failed to re-enter contract"
            );
        }
    }
}
