// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP7DigitalAsset} from "lsp7/contracts/LSP7DigitalAsset.sol";

contract LSP7MintWhenDeployed is LSP7DigitalAsset {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, false) {
        _mint(newOwner_, 1_000, true, "");
    }
}
