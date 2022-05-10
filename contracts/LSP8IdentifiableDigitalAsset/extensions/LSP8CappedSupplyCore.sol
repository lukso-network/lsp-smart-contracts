// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8CappedSupply} from "./ILSP8CappedSupply.sol";

// modules
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";

/**
 * @dev LSP8 extension, adds token supply cap.
 */
abstract contract LSP8CappedSupplyCore is LSP8IdentifiableDigitalAssetCore, ILSP8CappedSupply {
    // --- Errors

    error LSP8CappedSupplyRequired();
    error LSP8CappedSupplyCannotMintOverCap();

    // --- Storage

    uint256 internal _tokenSupplyCap;

    // --- Token queries

    /**
     * @inheritdoc ILSP8CappedSupply
     */
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return _tokenSupplyCap;
    }

    // --- Transfer functionality

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenSupplyCap() - totalSupply()` must be greater than zero.
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (totalSupply() + 1 > tokenSupplyCap()) {
            revert LSP8CappedSupplyCannotMintOverCap();
        }

        super._mint(to, tokenId, force, data);
    }
}
