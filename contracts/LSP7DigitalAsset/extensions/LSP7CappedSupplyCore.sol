// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP7CappedSupply} from "./ILSP7CappedSupply.sol";

// modules
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupplyCore is LSP7DigitalAssetCore, ILSP7CappedSupply {
    // --- Errors

    error LSP7CappedSupplyRequired();
    error LSP7CappedSupplyCannotMintOverCap();

    // --- Storage

    uint256 internal _tokenSupplyCap;

    // --- Token queries

    /**
     * @inheritdoc ILSP7CappedSupply
     */
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return _tokenSupplyCap;
    }

    // --- Transfer functionality

    /**
     * @dev Mints `amount` and transfers it to `to`.
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
    ) internal virtual override {
        if (totalSupply() + amount > tokenSupplyCap()) {
            revert LSP7CappedSupplyCannotMintOverCap();
        }

        super._mint(to, amount, force, data);
    }
}
