// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// errors
import {LSP7MintDisabled} from "./LSP7MintableErrors.sol";

/// @title LSP7MintableAbstract
/// @dev Abstract contract implementing a mintable LSP7 token extension, allowing any address granted the `MINTER_ROLE` to mint new tokens until minting is disabled.
/// Inherits from LSP7DigitalAsset to provide core token functionality.
abstract contract LSP7MintableAbstract is
    ILSP7Mintable,
    LSP7DigitalAsset,
    AccessControlExtendedAbstract
{
    /// @notice Indicates whether minting is currently enabled or not.
    bool public isMintable;

    /// @dev keccak256("MINTER_ROLE")
    bytes32 public constant MINTER_ROLE =
        0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6;

    /// @notice Initializes the contract with the minting status.
    /// @dev Sets the initial minting status. Inherits LSP7DigitalAsset constructor logic.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    constructor(bool mintable_) {
        isMintable = mintable_;
        emit MintingStatusChanged({enabled: mintable_});

        if (mintable_) {
            _grantRole(MINTER_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP7Mintable
    /// @custom:warning Once this function is called, any address holding the `MINTER_ROLE` will be inoperable.
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP7MintDisabled());
        isMintable = false;
        emit MintingStatusChanged({enabled: false});
    }

    /// @inheritdoc ILSP7Mintable
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override onlyRole(MINTER_ROLE) {
        _mint(to, amount, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlExtendedAbstract, LSP7DigitalAsset)
        returns (bool)
    {
        return
            AccessControlExtendedAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAsset.supportsInterface(interfaceId);
    }

    /// @notice Internal function to mint tokens, overridden to enforce minting status.
    /// @dev Checks if minting is enabled, reverting with LSP7MintDisabled if not. Calls the parent _mint function from LSP7DigitalAsset.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    ///
    /// @custom:warning This internal function does not check for `MINTER_ROLE` access control.
    /// Derived contracts that expose this function publicly and want to gate it by `MINTER_ROLE` must enforce it with `onlyRole(MINTER_ROLE)`.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        require(isMintable, LSP7MintDisabled());
        super._mint(to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant MINTER_ROLE to new accounts post-transfer
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }
}
