// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8AllowlistInitAbstract} from "../LSP8Allowlist/LSP8AllowlistInitAbstract.sol";

// interfaces
import {ILSP8CappedBalance} from "./ILSP8CappedBalance.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {LSP8CappedBalanceExceeded} from "./LSP8CappedBalanceErrors.sol";

/// @title LSP8CappedBalanceInitAbstract
/// @dev Abstract contract implementing a per-address NFT count cap for LSP8 tokens, with exemptions for allowlisted addresses. Inherits from LSP8AllowlistInitAbstract to integrate allowlist functionality.
abstract contract LSP8CappedBalanceInitAbstract is ILSP8CappedBalance, LSP8AllowlistInitAbstract {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The maximum number of NFTs allowed per address.
    uint256 private _tokenBalanceCap;

    /// @notice Initializes the LSP8CappedBalance contract with base token params and balance cap.
    /// @dev Initializes the LSP8Allowlist (which initializes LSP8IdentifiableDigitalAsset) and sets the balance cap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract, added to the allowlist.
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
        __LSP8Allowlist_init(name_, symbol_, newOwner_, lsp4TokenType_, lsp8TokenIdFormat_);
        __LSP8CappedBalance_init_unchained(tokenBalanceCap_);
    }

    /// @notice Unchained initializer for the balance cap.
    /// @dev Sets the balance cap.
    /// @param tokenBalanceCap_ The maximum number of NFTs per address, 0 to disable.
    function __LSP8CappedBalance_init_unchained(uint256 tokenBalanceCap_) internal virtual onlyInitializing {
        _tokenBalanceCap = tokenBalanceCap_;
    }

    /// @inheritdoc ILSP8CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _tokenBalanceCap;
    }

    /// @notice Checks if a token transfer complies with the balance cap.
    /// @dev The address(0) is not subject to balance cap checks as this address is used for burning tokens. Reverts with {LSP8CappedBalanceExceeded} if the recipient's NFT count after receiving the token would exceed the maximum allowed.
    /// @param to The address receiving the token.
    function _tokenBalanceCapCheck(
        address,
        /* from */
        address to,
        bytes32,
        /* tokenId */
        bool,
        /* force */
        bytes memory /* data */
    )
        internal
        virtual
    {
        require(
            to == address(0) || tokenBalanceCap() == 0 || balanceOf(to) + 1 <= tokenBalanceCap(),
            LSP8CappedBalanceExceeded(to, balanceOf(to), tokenBalanceCap())
        );
    }

    /// @notice Hook called before a token transfer to enforce balance cap restrictions.
    /// @dev Bypasses balance cap checks for allowlisted recipients. Applies cap checks for non-allowlisted recipients.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param tokenId The unique identifier of the token being transferred.
    /// @param force Whether to force the transfer.
    /// @param data Additional data for the transfer.
    function _beforeTokenTransfer(address from, address to, bytes32 tokenId, bool force, bytes memory data)
        internal
        virtual
        override
    {
        if (isAllowlisted(to)) return;
        _tokenBalanceCapCheck(from, to, tokenId, force, data);
    }
}
