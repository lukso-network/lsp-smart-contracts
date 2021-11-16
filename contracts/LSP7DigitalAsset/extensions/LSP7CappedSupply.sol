// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "./LSP7CappedSupplyCore.sol";
import "../LSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupply is LSP7DigitalAsset, LSP7CappedSupplyCore {

    constructor(uint256 tokenSupplyCap_) {
      require(tokenSupplyCap_ > 0, "LSP7CappedSupply: tokenSupplyCap is zero");
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
    )
      internal
      virtual
      override(LSP7DigitalAssetCore, LSP7CappedSupplyCore)
    {
        super._mint(to, amount, force, data);
    }
}
