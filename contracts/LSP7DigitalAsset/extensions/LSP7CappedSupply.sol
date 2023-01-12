// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupply is LSP7DigitalAsset {
    // --- Errors
    error LSP7CappedSupplyRequired();
    error LSP7CappedSupplyCannotMintOverCap();

    // --- Storage
    uint256 internal _tokenSupplyCap;

    /**
     * @notice Sets the token max supply
     * @param tokenSupplyCap_ The Token max supply
     */
    constructor(uint256 tokenSupplyCap_) {
        if (tokenSupplyCap_ == 0) {
            revert LSP7CappedSupplyRequired();
        }

        _tokenSupplyCap = tokenSupplyCap_;
    }

    // --- Token queries

    /**
     * @dev Returns the number of tokens that can be minted
     * @return The number of tokens that can be minted
     */
    function tokenSupplyCap() public view virtual returns (uint256) {
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
        bool allowNonLSP1Recipient,
        bytes memory data
    ) internal virtual override {
        if (totalSupply() + amount > tokenSupplyCap()) {
            revert LSP7CappedSupplyCannotMintOverCap();
        }

        super._mint(to, amount, allowNonLSP1Recipient, data);
    }
}
