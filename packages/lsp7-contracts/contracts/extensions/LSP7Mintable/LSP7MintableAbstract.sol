// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// errors
import {LSP7MintDisabled} from "./LSP7MintableErrors.sol";

/// @title LSP7MintableAbstract
/// @dev Abstract contract implementing a isMintable LSP7 token extension, allowing the owner to mint new tokens until minting is disabled. Inherits from LSP7DigitalAsset to provide core token functionality.
abstract contract LSP7MintableAbstract is ILSP7Mintable, LSP7DigitalAsset {
    /// @notice Indicates whether minting is currently enabled or not.
    bool public isMintable;

    /// @notice Initializes the contract with the minting status.
    /// @dev Sets the initial minting status. Inherits LSP7DigitalAsset constructor logic.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    constructor(bool mintable_) {
        isMintable = mintable_;
        emit MintingStatusChanged(mintable_);
    }

    /// @inheritdoc ILSP7Mintable
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP7MintDisabled());
        isMintable = false;
        emit MintingStatusChanged(false);
    }

    /// @inheritdoc ILSP7Mintable
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override onlyOwner {
        _mint(to, amount, force, data);
    }

    /// @notice Internal function to mint tokens, overridden to enforce minting status.
    /// @dev Checks if minting is enabled, reverting with LSP7MintDisabled if not. Calls the parent _mint function from LSP7DigitalAsset.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        require(isMintable, LSP7MintDisabled());
        super._mint(to, amount, force, data);
    }
}
