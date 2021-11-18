// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP7DigitalAssetCore.sol";

// interfaces
import "./ILSP7CappedSupply.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupplyCore is ILSP7CappedSupply, LSP7DigitalAssetCore {
    
    // --- Storage

    uint256 internal _tokenSupplyCap;


    // --- Token queries

    /**
     * @dev Returns the number of tokens that have been minted.
     */
    function tokenSupplyCap()
        public
        view
        virtual
        override
        returns (uint256)
    {
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
    )
        internal
        virtual
        override
    {
        require(totalSupply() + amount <= tokenSupplyCap(), "LSP7CappedSupply: tokenSupplyCap reached");
        super._mint(to, amount, force, data);
    }
}
