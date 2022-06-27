// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAssetInitAbstract} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";
import {LSP7CappedSupplyCore} from "./LSP7CappedSupplyCore.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupplyInitAbstract is
    LSP7DigitalAssetInitAbstract,
    LSP7CappedSupplyCore
{
    function _initialize(uint256 tokenSupplyCap_) internal virtual onlyInitializing {
        if (tokenSupplyCap_ == 0) {
            revert LSP7CappedSupplyRequired();
        }

        _tokenSupplyCap = tokenSupplyCap_;
    }

    // --- Overrides

    /**
     * @dev Mints `amount` tokens and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenSupplyCap() - totalSupply()` must be greater than zero.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7DigitalAssetCore, LSP7CappedSupplyCore) {
        super._mint(to, amount, force, data);
    }
}
