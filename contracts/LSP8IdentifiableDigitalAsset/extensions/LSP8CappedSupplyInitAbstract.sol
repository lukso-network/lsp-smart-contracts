// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetCore} from "../LSP8IdentifiableDigitalAssetCore.sol";
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8CappedSupplyCore} from "./LSP8CappedSupplyCore.sol";

/**
 * @dev LSP8 extension, adds token supply cap.
 */
abstract contract LSP8CappedSupplyInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP8CappedSupplyCore
{
    function _initialize(uint256 tokenSupplyCap_) internal virtual onlyInitializing {
        if (tokenSupplyCap_ == 0) {
            revert LSP8CappedSupplyRequired();
        }

        _tokenSupplyCap = tokenSupplyCap_;
    }

    // --- Overrides

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
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore, LSP8CappedSupplyCore) {
        super._mint(to, tokenId, force, data);
    }
}
