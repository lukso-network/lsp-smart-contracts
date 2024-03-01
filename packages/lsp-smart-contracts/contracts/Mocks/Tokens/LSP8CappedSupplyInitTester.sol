// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8CappedSupplyInitAbstract
} from "@lukso/lsp8-contracts/contracts/extensions/LSP8CappedSupplyInitAbstract.sol";

contract LSP8CappedSupplyInitTester is LSP8CappedSupplyInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        LSP8CappedSupplyInitAbstract._initialize(tokenSupplyCap_);
    }

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
