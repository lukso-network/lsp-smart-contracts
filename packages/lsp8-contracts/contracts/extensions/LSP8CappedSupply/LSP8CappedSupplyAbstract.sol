// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8IdentifiableDigitalAsset} from "../../LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8CappedSupply} from "./ILSP8CappedSupply.sol";

// errors
import {LSP8CappedSupplyCannotMintOverCap} from "./LSP8CappedSupplyErrors.sol";

/// @title LSP8CappedSupplyAbstract
/// @dev Abstract contract implementing a token supply cap for LSP8 tokens.
abstract contract LSP8CappedSupplyAbstract is ILSP8CappedSupply, LSP8IdentifiableDigitalAsset {
    /// @notice The immutable maximum token supply.
    uint256 private immutable _TOKEN_SUPPLY_CAP;

    /// @notice Deploying a `LSP8CappedSupply` token contract with max token supply cap set to `tokenSupplyCap_`.
    /// @dev Deploy a `LSP8CappedSupply` token contract and set the maximum token supply token cap up to which it is not possible to mint more tokens.
    /// @param tokenSupplyCap_ The maximum total supply, 0 to disable.
    constructor(uint256 tokenSupplyCap_) {
        _TOKEN_SUPPLY_CAP = tokenSupplyCap_;
    }

    /// @inheritdoc ILSP8CappedSupply
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return _TOKEN_SUPPLY_CAP;
    }

    /// @dev Checks if minting a new token would exceed the token supply cap.
    function _tokenSupplyCapCheck(
        address,
        /* to */
        bytes32,
        /* tokenId */
        bool,
        /* force */
        bytes memory /* data */
    )
        internal
        virtual
    {
        require(tokenSupplyCap() == 0 || totalSupply() + 1 <= tokenSupplyCap(), LSP8CappedSupplyCannotMintOverCap());
    }

    /// @dev Same as {_mint} but allows to mint only if the {totalSupply} does not exceed the {tokenSupplyCap} after the token has been minted.
    function _mint(address to, bytes32 tokenId, bool force, bytes memory data) internal virtual override {
        _tokenSupplyCapCheck(to, tokenId, force, data);

        super._mint(to, tokenId, force, data);
    }
}
