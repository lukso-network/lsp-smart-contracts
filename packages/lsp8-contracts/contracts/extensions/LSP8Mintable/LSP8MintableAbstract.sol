// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP8Mintable} from "./ILSP8Mintable.sol";

// errors
import {LSP8MintDisabled} from "./LSP8MintableErrors.sol";

/// @title LSP8MintableAbstract
/// @dev Abstract contract implementing a mintable LSP8 token extension, allowing the owner to mint any address granted the `MINTER_ROLE` to mint new tokens until minting is disabled.
/// Inherits from LSP8IdentifiableDigitalAsset to provide core token functionality.
abstract contract LSP8MintableAbstract is
    ILSP8Mintable,
    AccessControlExtendedAbstract,
    LSP8IdentifiableDigitalAsset
{
    /// @notice Indicates whether minting is currently enabled.
    bool public isMintable;

    /// @dev `"MINTER_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant MINTER_ROLE =
        0x4d494e5445525f524f4c45000000000000000000000000000000000000000000;

    /// @notice Initializes the contract with the minting status.
    /// @dev Sets the initial minting status. Inherits LSP8IdentifiableDigitalAsset constructor logic.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    constructor(bool mintable_) {
        isMintable = mintable_;
        emit MintingStatusChanged(mintable_);
        _grantRole(MINTER_ROLE, owner());
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
    ) public virtual override onlyRole(MINTER_ROLE) {
        _mint(to, tokenId, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlExtendedAbstract, LSP8IdentifiableDigitalAsset)
        returns (bool)
    {
        return
            AccessControlExtendedAbstract.supportsInterface(interfaceId) ||
            LSP8IdentifiableDigitalAsset.supportsInterface(interfaceId);
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

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        super._transferOwnership(newOwner);
    }
}
