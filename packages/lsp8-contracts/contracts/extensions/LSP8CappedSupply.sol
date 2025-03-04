// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 token extension to add a max token supply cap.
 */
abstract contract LSP8CappedSupply is LSP8IdentifiableDigitalAsset {
    // --- Errors

    /**
     * @notice The `tokenSupplyCap` must be set and cannot be `0`.
     * @dev Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.
     */
    error LSP8CappedSupplyRequired();

    /**
     * @notice Cannot mint anymore as total supply reached the maximum cap.
     * @dev Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.
     */
    error LSP8CappedSupplyCannotMintOverCap();

    // --- Storage
    uint256 private immutable _TOKEN_SUPPLY_CAP;

    /**
     * @notice Deploying a `LSP8CappedSupply` token contract with max token supply cap set to `tokenSupplyCap_`.
     * @dev Deploy a `LSP8CappedSupply` token contract and set the maximum token supply token cap up to which
     * it is not possible to mint more tokens.
     *
     * @param tokenSupplyCap_ The maximum token supply.
     *
     * @custom:requirements
     * - `tokenSupplyCap_` MUST NOT be 0.
     */
    constructor(uint256 tokenSupplyCap_) {
        if (tokenSupplyCap_ == 0) {
            revert LSP8CappedSupplyRequired();
        }

        _TOKEN_SUPPLY_CAP = tokenSupplyCap_;
    }

    // --- Token queries

    /**
     * @notice The maximum supply amount of tokens allowed to exist is `_TOKEN_SUPPLY_CAP`.
     *
     * @dev Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches
     * reaches {totalSupplyCap}, it is not possible to mint more tokens.
     *
     * @return The maximum number of tokens that can exist in the contract.
     */
    function tokenSupplyCap() public view virtual returns (uint256) {
        return _TOKEN_SUPPLY_CAP;
    }

    // --- Transfer functionality

    /**
     * @dev Same as {_mint} but allows to mint only if newly minted `tokenId` does not increase the {totalSupply}
     * over the {tokenSupplyCap}.
     * after a new `tokenId` has of tokens have been minted.
     *
     * @custom:requirements
     * - {totalSupply} + 1 must not be greater than the {tokenSupplyCap} when calling this function.
     * - `to` cannot be the zero address.
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
