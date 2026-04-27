// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../AccessControlExtended/AccessControlExtendedInitAbstract.sol";

// interfaces
import {ILSP8CappedBalance} from "./ILSP8CappedBalance.sol";

// errors
import {LSP8CappedBalanceExceeded} from "./LSP8CappedBalanceErrors.sol";

/// @title LSP8CappedBalanceInitAbstract
/// @dev Abstract contract implementing a per-address NFT count cap for LSP8 tokens, with role-based exemptions.
abstract contract LSP8CappedBalanceInitAbstract is
    ILSP8CappedBalance,
    LSP8IdentifiableDigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    /// @notice The dead address is also commonly used for burning tokens as an alternative to address(0).
    address internal constant _DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    /// @dev keccak256("UNCAPPED_BALANCE_ROLE")
    bytes32 public constant UNCAPPED_BALANCE_ROLE =
        0x975773d1e0a917a74b57f36a377f439ffff6271648aebdbff75a52ab58eb7bad;

    /// @notice The maximum number of NFTs allowed per address.
    uint256 private _tokenBalanceCap;

    /// @notice Initializes the LSP8CappedBalance contract with base token params and balance cap.
    /// @dev Initializes the LSP8IdentifiableDigitalAsset base, the access control layer and the balance cap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param tokenBalanceCap_ The maximum number of NFTs per address, 0 to disable.
    function __LSP8CappedBalance_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenBalanceCap_
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __AccessControlExtended_init();
        __LSP8CappedBalance_init_unchained(tokenBalanceCap_);
    }

    /// @notice Unchained initializer for the balance cap.
    /// @dev Sets the balance cap. If set, grants the initial uncapped balance role exemption to the contract owner.
    /// @param tokenBalanceCap_ The maximum number of NFTs allowed per address. Set to 0 to disable.
    function __LSP8CappedBalance_init_unchained(
        uint256 tokenBalanceCap_
    ) internal virtual onlyInitializing {
        _tokenBalanceCap = tokenBalanceCap_;

        if (tokenBalanceCap_ != 0) {
            _grantRole(UNCAPPED_BALANCE_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP8CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _tokenBalanceCap;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            AccessControlExtendedInitAbstract,
            LSP8IdentifiableDigitalAssetInitAbstract
        )
        returns (bool)
    {
        return
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId) ||
            LSP8IdentifiableDigitalAssetInitAbstract.supportsInterface(
                interfaceId
            );
    }

    /// @notice Checks if a token transfer complies with the balance cap.
    /// @dev The address(0) is not subject to balance cap checks as this address is used for burning tokens. Reverts with {LSP8CappedBalanceExceeded} if the recipient's NFT count after receiving the token would exceed the maximum allowed.
    /// @param to The address receiving the token.
    function _tokenBalanceCapCheck(
        address /* from */,
        address to,
        bytes32 /* tokenId */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Address(0) and 0x0000...dead addresses are used for burning tokens
        if (to == address(0) || to == _DEAD_ADDRESS) return;

        // Do not check for addresses exempted from balance cap
        if (hasRole(UNCAPPED_BALANCE_ROLE, to)) return;

        uint256 maxBalanceAllowed = tokenBalanceCap();
        bool isBalanceCapEnabled = maxBalanceAllowed != 0;

        if (!isBalanceCapEnabled) return;

        require(
            (balanceOf(to) + 1) <= tokenBalanceCap(),
            LSP8CappedBalanceExceeded(to, balanceOf(to), tokenBalanceCap())
        );
    }

    /// @notice Hook called before a token transfer to enforce balance cap restrictions.
    /// @dev Bypasses balance cap checks for recipients holding `UNCAPPED_BALANCE_ROLE`. Applies cap checks for all other recipients.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param tokenId The unique identifier of the token being transferred.
    /// @param force Whether to force the transfer.
    /// @param data Additional data for the transfer.
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        _tokenBalanceCapCheck(from, to, tokenId, force, data);
        super._beforeTokenTransfer(from, to, tokenId, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant UNCAPPED_BALANCE_ROLE to new accounts post-transfer
        _setRoleAdmin(UNCAPPED_BALANCE_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }
}
