// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// interfaces
import {ILSP8CappedSupply} from "./ILSP8CappedSupply.sol";

// errors
import {LSP8CappedSupplyCannotMintOverCap} from "./LSP8CappedSupplyErrors.sol";

/// @title LSP8CappedSupplyInitAbstract
/// @dev Abstract contract implementing a token supply cap for LSP8 tokens.
abstract contract LSP8CappedSupplyInitAbstract is
    ILSP8CappedSupply,
    LSP8IdentifiableDigitalAssetInitAbstract
{
    /// @notice The maximum token supply.
    uint256 private _tokenSupplyCap;

    /// @notice Initializes the contract with the token supply cap.
    /// @dev Sets the maximum token supply.
    /// @param tokenSupplyCap_ The maximum total supply, 0 to disable.
    function __LSP8CappedSupply_init(
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        __LSP8CappedSupply_init_unchained(tokenSupplyCap_);
    }

    function __LSP8CappedSupply_init_unchained(
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        _tokenSupplyCap = tokenSupplyCap_;
    }

    /// @inheritdoc ILSP8CappedSupply
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return _tokenSupplyCap;
    }

    /// @dev Checks if minting a new token would exceed the token supply cap.
    function _tokenSupplyCapCheck(
        address /* to */,
        bytes32 /* tokenId */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        if (tokenSupplyCap() == 0) return;
        // For LSP8, each mint is always 1 NFT
        if (totalSupply() + 1 <= tokenSupplyCap()) return;

        revert LSP8CappedSupplyCannotMintOverCap();
    }

    /// @dev Same as {_mint} but allows to mint only if the {totalSupply} does not exceed the {tokenSupplyCap} after the token has been minted.
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        _tokenSupplyCapCheck(to, tokenId, force, data);

        super._mint(to, tokenId, force, data);
    }
}
