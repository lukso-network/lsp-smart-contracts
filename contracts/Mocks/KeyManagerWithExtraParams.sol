// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP6KeyManager} from "../LSP6KeyManager/LSP6KeyManager.sol";

contract KeyManagerWithExtraParams is LSP6KeyManager {
    address public immutable FIRST_PARAM;
    address public immutable LAST_PARAM;

    constructor(
        address firstParam_,
        address target_,
        address lastParam_
    ) LSP6KeyManager(target_) {
        FIRST_PARAM = firstParam_;
        LAST_PARAM = lastParam_;
    }
}
