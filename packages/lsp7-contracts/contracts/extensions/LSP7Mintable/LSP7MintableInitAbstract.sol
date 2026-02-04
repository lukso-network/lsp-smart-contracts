// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAssetInitAbstract.sol";

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// errors
import {LSP7MintDisabled} from "./LSP7MintableErrors.sol";

/// @title LSP7MintableInitAbstract
/// @dev Abstract contract implementing a isMintable LSP7 token extension, allowing the owner to mint new tokens until minting is disabled. Inherits from LSP7DigitalAsset to provide core token functionality.
abstract contract LSP7MintableInitAbstract is ILSP7Mintable, LSP7DigitalAssetInitAbstract {
    /// @notice Indicates whether minting is currently enabled or not.
    bool public isMintable;

    /// @notice Initializes the LSP7Mintable contract with base token params and minting status.
    /// @dev Initializes the LSP7DigitalAsset base and sets the minting status.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    function __LSP7Mintable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_);
        __LSP7Mintable_init_unchained(mintable_);
    }

    /// @notice Unchained initializer for the minting status.
    /// @dev Sets the initial minting status.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    function __LSP7Mintable_init_unchained(bool mintable_) internal virtual onlyInitializing {
        isMintable = mintable_;
    }

    /// @inheritdoc ILSP7Mintable
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP7MintDisabled());
        isMintable = false;
        emit MintingDisabled();
    }

    /// @inheritdoc ILSP7Mintable
    function mint(address to, uint256 amount, bool force, bytes memory data) public virtual override onlyOwner {
        _mint(to, amount, force, data);
    }

    /// @notice Internal function to mint tokens, overridden to enforce minting status.
    /// @dev Checks if minting is enabled, reverting with LSP7MintDisabled if not. Calls the parent _mint function from LSP7DigitalAsset.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    function _mint(address to, uint256 amount, bool force, bytes memory data) internal virtual override {
        require(isMintable, LSP7MintDisabled());
        super._mint(to, amount, force, data);
    }
}
