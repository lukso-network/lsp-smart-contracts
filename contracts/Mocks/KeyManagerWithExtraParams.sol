// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {LSP6KeyManager} from "../LSP6KeyManager/LSP6KeyManager.sol";

contract KeyManagerWithExtraParams is LSP6KeyManager {
    address public immutable firstParam;
    address public immutable lastParam;

    constructor(
        address firstParam_,
        address target_,
        address lastParam_
    ) LSP6KeyManager(target_) {
        firstParam = firstParam_;
        lastParam = lastParam_;
    }
}
