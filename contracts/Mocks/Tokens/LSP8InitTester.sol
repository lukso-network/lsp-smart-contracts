// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8BurnableInitAbstract
} from "@lukso/lsp8-contracts/contracts/extensions/LSP8BurnableInitAbstract.sol";

contract LSP8InitTester is
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP8BurnableInitAbstract
{
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    ) public initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}
