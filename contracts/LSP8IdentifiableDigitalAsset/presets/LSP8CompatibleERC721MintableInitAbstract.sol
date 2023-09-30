// SPDX-License-Identifier: Apache-2.0
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
        address newOwner_,
        uint256 tokenIdType_
    ) internal virtual override onlyInitializing {
        LSP8CompatibleERC721InitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            tokenIdType_
        );
    }

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
