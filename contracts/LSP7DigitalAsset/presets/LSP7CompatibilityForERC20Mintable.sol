// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LSP7CompatibilityForERC20} from "../extensions/LSP7CompatibilityForERC20.sol";

contract LSP7CompatibilityForERC20Mintable is LSP7CompatibilityForERC20 {
    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7CompatibilityForERC20(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public onlyOwner {
        _mint(to, amount, force, data);
    }
}
