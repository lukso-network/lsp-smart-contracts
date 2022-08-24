// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {LSP8CompatibleERC721InitAbstract} from "../extensions/LSP8CompatibleERC721InitAbstract.sol";
import {ReentrancyGuard} from "../..//Utils/ReentrancyGuard.sol";

contract LSP8CompatibleERC721MintableInitAbstract is
    LSP8CompatibleERC721InitAbstract,
    ReentrancyGuard
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
        bool force,
        bytes memory data
    ) public onlyOwner nonReentrant {
        _mint(to, tokenId, force, data);
    }
}
