// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8CappedSupplyInitAbstract} from "@lukso/lsp8-contracts/contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyInitAbstract.sol";

contract LSP8CappedSupplyInitTester is LSP8CappedSupplyInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    ) public virtual initializer {
        __LSP8CappedSupply_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            tokenSupplyCap_
        );
    }

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
