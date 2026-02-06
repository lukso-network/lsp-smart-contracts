// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// errors
import {LSP8MintDisabled} from "./LSP8MintableErrors.sol";

/// @title LSP8MintableAbstract
/// @dev Abstract contract implementing a mintable LSP8 token extension, allowing the owner to mint new tokens until minting is disabled. Inherits from LSP8IdentifiableDigitalAsset to provide core token functionality.
abstract contract LSP8MintableAbstract is
    ILSP8Mintable,
    LSP8IdentifiableDigitalAsset
{
    /// @notice Indicates whether minting is currently enabled.
    bool public isMintable;

    /// @notice Initializes the contract with the minting status.
    /// @dev Sets the initial minting status. Inherits LSP8IdentifiableDigitalAsset constructor logic.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    constructor(bool mintable_) {
        isMintable = mintable_;
        emit MintingStatusChanged(mintable_);
    }

    /// @inheritdoc ILSP8Mintable
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP8MintDisabled());
        isMintable = false;
        emit MintingStatusChanged(false);
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
    /// @dev Checks if minting is enabled, reverting with LSP8MintDisabled if not. Calls the parent _mint function from LSP8IdentifiableDigitalAsset.
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
