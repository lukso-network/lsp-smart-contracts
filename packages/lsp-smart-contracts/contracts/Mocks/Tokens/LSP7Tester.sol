// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAsset
} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";
import {
    LSP7Burnable
} from "@lukso/lsp7-contracts/contracts/extensions/LSP7Burnable.sol";

contract LSP7Tester is LSP7DigitalAsset, LSP7Burnable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, false) {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}
