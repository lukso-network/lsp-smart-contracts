// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAssetInitAbstract.sol";

// errors
import {LSP7CappedSupplyCannotMintOverCap} from "./LSP7CappedSupplyErrors.sol";

/**
 * @dev LSP7 token extension to add a max token supply cap (proxy version).
 */
abstract contract LSP7CappedSupplyInitAbstract is LSP7DigitalAssetInitAbstract {
    uint256 private _tokenSupplyCap;

    /// @notice Initializes the LSP7CappedSupply contract with base token params and supply cap.
    /// @dev Initializes the LSP7DigitalAsset base and sets the maximum token supply cap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    /// @param tokenSupplyCap_ The maximum total supply in wei, 0 to disable.
    function __LSP7CappedSupply_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenSupplyCap_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __LSP7CappedSupply_init_unchained(tokenSupplyCap_);
    }

    /// @notice Unchained initializer for the token supply cap.
    /// @dev Sets the maximum token supply cap.
    /// @param tokenSupplyCap_ The maximum total supply in wei, 0 to disable.
    function __LSP7CappedSupply_init_unchained(
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
        require(
            tokenSupplyCap() == 0 ||
                (totalSupply() + amount) <= tokenSupplyCap(),
            LSP7CappedSupplyCannotMintOverCap()
        );
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
