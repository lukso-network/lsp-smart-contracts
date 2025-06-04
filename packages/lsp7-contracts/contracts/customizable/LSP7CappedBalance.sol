// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";

contract LSP7CappedBalance is LSP7DigitalAsset {
    uint256 public immutable MAX_ALLOWED_BALANCE;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 maxAllowedBalance_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
    {
        MAX_ALLOWED_BALANCE = maxAllowedBalance_;
    }

    function _beforeTokenTransfer(
        address /* from */,
        address to,
        uint256 amount,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual override {
        // CHECK that recipient can only hold x amount of tokens
        require(
            balanceOf(to) + amount <= MAX_ALLOWED_BALANCE,
            "Maximum allowed balance exeeded"
        );
    }
}
