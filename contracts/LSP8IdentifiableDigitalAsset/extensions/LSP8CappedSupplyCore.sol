// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP8IdentifiableDigitalAssetCore.sol";

// interfaces
import "./ILSP8CappedSupply.sol";

/**
 * @dev LSP8 extension, adds token supply cap.
 */
abstract contract LSP8CappedSupplyCore is ILSP8CappedSupply, LSP8IdentifiableDigitalAssetCore {
    
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
    )
        internal
        virtual
        override
    {
        require(totalSupply() + 1 <= tokenSupplyCap(), "LSP8CappedSupply: tokenSupplyCap reached");
        super._mint(to, tokenId, force, data);
    }
}
