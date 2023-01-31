// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {LSP7CompatibleERC20} from "../extensions/LSP7CompatibleERC20.sol";

contract LSP7CompatibleERC20Mintable is LSP7CompatibleERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7CompatibleERC20(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public onlyOwner {
        _mint(to, amount, allowNonLSP1Recipient, data);
    }
}
