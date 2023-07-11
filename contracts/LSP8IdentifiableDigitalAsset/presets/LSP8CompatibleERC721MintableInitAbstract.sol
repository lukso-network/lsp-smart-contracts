// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// modules
import {
    LSP8CompatibleERC721InitAbstract
} from "../extensions/LSP8CompatibleERC721InitAbstract.sol";

/**
 * @title LSP8CompatibleERC721MintableInitAbstract preset contract (inheritable proxy version) with a public mint function callable only by the contract {owner}
 */
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

    /**
     * @dev Public {_mint} function only callable by the {owner}.
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
