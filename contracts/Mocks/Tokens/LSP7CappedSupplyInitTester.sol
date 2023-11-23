// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAsset/LSP7DigitalAssetInitAbstract.sol";
import {
    LSP7CappedSupplyInitAbstract
} from "../../LSP7DigitalAsset/extensions/LSP7CappedSupplyInitAbstract.sol";

contract LSP7CappedSupplyInitTester is LSP7CappedSupplyInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenSupplyCap_,
        uint256 lsp4TokenType_
    ) public virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            true,
            lsp4TokenType_
        );
        LSP7CappedSupplyInitAbstract._initialize(tokenSupplyCap_);
    }

    function mint(address to, uint256 amount) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, "token printer go brrr");
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount, "feel the burn");
    }
}
