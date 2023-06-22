// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// modules
import {
    LSP8CompatibleERC721InitAbstract
} from "../extensions/LSP8CompatibleERC721InitAbstract.sol";

contract LSP8CompatibleERC721MintableInitAbstract is
    LSP8CompatibleERC721InitAbstract
{
    /**
     * @inheritdoc LSP8CompatibleERC721InitAbstract
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP8CompatibleERC721InitAbstract._initialize(name_, symbol_, newOwner_);
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public onlyOwner {
        _mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
