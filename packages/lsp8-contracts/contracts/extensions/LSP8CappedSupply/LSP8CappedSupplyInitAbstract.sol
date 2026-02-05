// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";

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

    /// @notice Initializes the LSP8CappedSupply contract with base token params and supply cap.
    /// @dev Initializes the LSP8IdentifiableDigitalAsset base and sets the maximum token supply cap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param tokenSupplyCap_ The maximum total supply, 0 to disable.
    function __LSP8CappedSupply_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __LSP8CappedSupply_init_unchained(tokenSupplyCap_);
    }

    /// @notice Unchained initializer for the token supply cap.
    /// @dev Sets the maximum token supply cap.
    /// @param tokenSupplyCap_ The maximum total supply, 0 to disable.
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
        require(
            tokenSupplyCap() == 0 || totalSupply() + 1 <= tokenSupplyCap(),
            LSP8CappedSupplyCannotMintOverCap()
        );
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
