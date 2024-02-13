// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAsset
} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";
import {
    LSP7CappedSupply
} from "@lukso/lsp7-contracts/contracts/extensions/LSP7CappedSupply.sol";

contract LSP7CappedSupplyTester is LSP7CappedSupply {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, true)
        LSP7CappedSupply(tokenSupplyCap_)
    {}

    function mint(address to, uint256 amount) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, "token printer go brrr");
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount, "feel the burn");
    }
}
