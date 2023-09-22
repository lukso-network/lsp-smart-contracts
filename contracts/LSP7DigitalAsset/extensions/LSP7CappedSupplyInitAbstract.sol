// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

/**
 * @dev LSP7 token extension to add a max token supply cap (proxy version).
 */
abstract contract LSP7CappedSupplyInitAbstract is LSP7DigitalAssetInitAbstract {
    // --- Errors

    /**
     * @notice The `tokenSupplyCap` must be set and cannot be `0`.
     * @dev Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.
     */
    error LSP7CappedSupplyRequired();

    /**
     * @notice Cannot mint anymore as total supply reached the maximum cap.
     * @dev Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.
     */
    error LSP7CappedSupplyCannotMintOverCap();

    // --- Storage
    uint256 private _tokenSupplyCap;

    /**
     * @notice Deploying a `LSP7CappedSupply` token contract with max token supply cap set to `tokenSupplyCap_`.
     * @dev Deploy a `LSP7CappedSupply` token contract and set the maximum token supply token cap up to which
     * it is not possible to mint more tokens.
     *
     * @param tokenSupplyCap_ The maximum token supply.
     *
     * @custom:requirements
     * - `tokenSupplyCap_` MUST NOT be 0.
     */
    function _initialize(
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        if (tokenSupplyCap_ == 0) {
            revert LSP7CappedSupplyRequired();
        }

        _tokenSupplyCap = tokenSupplyCap_;
    }

    // --- Token queries

    /**
     * @notice The maximum supply amount of tokens allowed to exist is `_tokenSupplyCap`.
     * @dev Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches
     * reaches {totalSuuplyCap}, it is not possible to mint more tokens.
     *
     * @return The maximum number of tokens that can exist in the contract.
     */
    function tokenSupplyCap() public view virtual returns (uint256) {
        return _tokenSupplyCap;
    }

    // --- Transfer functionality

    /**
     * @dev Same as {_mint} but allows to mint only if the {totalSupply} does not exceed the {tokenSupplyCap}
     * after `amount` of tokens have been minted.
     *
     * @custom:requirements
     * - {tokenSupplyCap} - {totalSupply} must be greater than zero.
     * - `to` cannot be the zero address.
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
