// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

/**
 * @title LSP8IdentifiableDigitalAsset deployable preset contract with a public {mint} function callable only by the contract {owner}.
 */
contract LSP8Mintable is LSP8IdentifiableDigitalAsset, ILSP8Mintable {
    /**
     * @notice Deploying a `LSP8Mintable` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_) {}

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
    ) public virtual override onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
