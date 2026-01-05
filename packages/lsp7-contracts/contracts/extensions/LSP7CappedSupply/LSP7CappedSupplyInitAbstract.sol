// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAssetInitAbstract.sol";

// errors
import {LSP7CappedSupplyCannotMintOverCap} from "./LSP7CappedSupplyErrors.sol";

/**
 * @dev LSP7 token extension to add a max token supply cap (proxy version).
 */
abstract contract LSP7CappedSupplyInitAbstract is LSP7DigitalAssetInitAbstract {
    uint256 private _tokenSupplyCap;

    /// @notice Deploying a `LSP7CappedSupply` token contract with max token supply cap set to `tokenSupplyCap_`.
    /// @dev Deploy a `LSP7CappedSupply` token contract and set the maximum token supply token cap up to which it is not possible to mint more tokens.
    /// @param tokenSupplyCap_ The maximum total supply in wei, 0 to disable.
    function _initialize(
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        _tokenSupplyCap = tokenSupplyCap_;
    }

    /// @notice The maximum supply amount of tokens allowed to exist is `_tokenSupplyCap`.
    /// @dev Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches {totalSupplyCap}, it is not possible to mint more tokens.
    /// @return The maximum number of tokens that can exist in the contract.
    function tokenSupplyCap() public view virtual returns (uint256) {
        return _tokenSupplyCap;
    }

    /// @dev Checks if minting `amount` of tokens would exceed the token supply cap.
    function _tokenSupplyCapCheck(
        address /* to */,
        uint256 amount,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        if (tokenSupplyCap() == 0) return;
        if (totalSupply() + amount <= tokenSupplyCap()) return;

        revert LSP7CappedSupplyCannotMintOverCap();
    }

    /// @dev Same as {_mint} but allows to mint only if the {totalSupply} does not exceed the {tokenSupplyCap} after `amount` of tokens have been minted.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        _tokenSupplyCapCheck(to, amount, force, data);

        super._mint(to, amount, force, data);
    }
}
