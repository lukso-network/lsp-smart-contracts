// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/* solhint-disable */
contract Reentrancy {
    bytes _payload;
    address _target;

    bool switchFallback;

    constructor(address _keyManager) {
        _target = _keyManager;
    }

    function loadPayload(bytes memory _dataPayload) public {
        _payload = _dataPayload;
    }

    fallback() external payable {
        if (!switchFallback) {
            switchFallback = true;
            (bool success, bytes memory returnData) = _target.call(_payload);
            bytes memory result = Address.verifyCallResult(success, returnData, "");
        }
    }
}
/* solhint-enable */
