// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8BurnableInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8BurnableInitAbstract.sol";

contract LSP8BurnableInitTester is LSP8BurnableInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_,
        uint256 lsp4TokenType_
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            tokenIdType_,
            lsp4TokenType_
        );
    }
}
