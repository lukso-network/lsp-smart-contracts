// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// errors
import {
    LSP8MintDisabled,
    LSP8MintingAlreadyDisabled
} from "./LSP8MintableErrors.sol";

/// @title LSP8MintableInitAbstract
/// @dev Abstract contract implementing a mintable LSP8 token extension, allowing the owner to mint new tokens until minting is disabled. Inherits from LSP8IdentifiableDigitalAssetInitAbstract to provide core token functionality.
abstract contract LSP8MintableInitAbstract is
    ILSP8Mintable,
    LSP8IdentifiableDigitalAssetInitAbstract
{
    /// @notice Indicates whether minting is currently enabled.
    bool public isMintable;

    /// @notice Initializes the LSP8Mintable contract with base token params and minting status.
    /// @dev Initializes the LSP8IdentifiableDigitalAsset base and sets the initial minting status.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    function __LSP8Mintable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool mintable_
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __LSP8Mintable_init_unchained(mintable_);
    }

    /// @notice Unchained initializer for the minting status.
    /// @dev Sets the initial minting status.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    function __LSP8Mintable_init_unchained(
        bool mintable_
    ) internal virtual onlyInitializing {
        isMintable = mintable_;
    }

    /// @inheritdoc ILSP8Mintable
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP8MintingAlreadyDisabled());
        isMintable = false;
        emit MintingDisabled();
    }

    /// @inheritdoc ILSP8Mintable
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public virtual override onlyOwner {
        _mint(to, tokenId, force, data);
    }

    /// @notice Internal function to mint tokens, overridden to enforce minting status.
    /// @dev Checks if minting is enabled, reverting with LSP8MintDisabled if not. Calls the parent _mint function from LSP8IdentifiableDigitalAssetInitAbstract.
    /// @param to The address to receive the minted token.
    /// @param tokenId The unique identifier for the token to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`'s UniversalReceiver hook, if applicable.
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        require(isMintable, LSP8MintDisabled());

        super._mint(to, tokenId, force, data);
    }
}
