// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";

/**
 * @dev LSP8 extension, adds token supply cap.
 */
abstract contract LSP8CappedSupplyInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract
{
    // --- Errors
    error LSP8CappedSupplyRequired();
    error LSP8CappedSupplyCannotMintOverCap();

    // --- Storage
    uint256 private _tokenSupplyCap;

    function _initialize(
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        if (tokenSupplyCap_ == 0) {
            revert LSP8CappedSupplyRequired();
        }

        _tokenSupplyCap = tokenSupplyCap_;
    }

    // --- Token queries

    /**
     * @dev Returns the number of tokens that can be minted.
     * @return The token max supply
     */
    function tokenSupplyCap() public view virtual returns (uint256) {
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
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        if (totalSupply() + 1 > tokenSupplyCap()) {
            revert LSP8CappedSupplyCannotMintOverCap();
        }

        super._mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
