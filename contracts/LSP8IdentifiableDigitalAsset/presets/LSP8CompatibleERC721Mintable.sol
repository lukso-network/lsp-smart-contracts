// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import {LSP8CompatibleERC721} from "../extensions/LSP8CompatibleERC721.sol";

/**
 * @title LSP8CompatibleERC721Mintable deployable preset contract with a public {mint} function callable only by the contract {owner}.
 */
contract LSP8CompatibleERC721Mintable is LSP8CompatibleERC721 {
    /**
     * @notice Deploying a `LSP8CompatibleERC721Mintable` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8CompatibleERC721(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
    {}

    /**
     * @notice Minting tokenId `tokenId` for address `to` with the additional data `data` (Note: allow non-LSP1 recipient is set to `force`).
     *
     * @dev Public {_mint} function only callable by the {owner}.
     *
     * @param to The address that will receive the minted `tokenId`.
     * @param tokenId The tokenId to mint.
     * @param force Set to `false` to ensure that you are minting for a recipient that implements LSP1, `false` otherwise for forcing the minting.
     * @param data Any addition data to be sent alongside the minting.
     */
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
