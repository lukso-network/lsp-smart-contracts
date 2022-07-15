// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LSP8CompatibleERC721} from "../extensions/LSP8CompatibleERC721.sol";

contract LSP8CompatibleERC721Mintable is LSP8CompatibleERC721 {
    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8CompatibleERC721(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
