// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP6KeyManagerInit} from "../LSP6KeyManager/LSP6KeyManagerInit.sol";

contract KeyManagerInitWithExtraParams is LSP6KeyManagerInit {
    address public firstParam;
    address public lastParam;

    function initializeWithExtraParams(
        address firstParam_,
        address target_,
        address lastParam_
    ) public initializer {
        firstParam = firstParam_;
        _initialize(target_);
        lastParam = lastParam_;
    }
}
