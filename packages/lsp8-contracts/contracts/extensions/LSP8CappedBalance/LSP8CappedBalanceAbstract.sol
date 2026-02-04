// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8AllowlistAbstract} from "../LSP8Allowlist/LSP8AllowlistAbstract.sol";

// interfaces
import {ILSP8CappedBalance} from "./ILSP8CappedBalance.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {LSP8CappedBalanceExceeded} from "./LSP8CappedBalanceErrors.sol";

/// @title LSP8CappedBalanceAbstract
/// @dev Abstract contract implementing a per-address NFT count cap for LSP8 tokens, with exemptions for allowlisted addresses. Inherits from LSP8AllowlistAbstract to integrate allowlist functionality.
abstract contract LSP8CappedBalanceAbstract is
    ILSP8CappedBalance,
    LSP8AllowlistAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The immutable maximum number of NFTs allowed per address.
    uint256 private immutable _TOKEN_BALANCE_CAP;

    /// @notice Initializes the contract with a token balance cap.
    /// @dev Sets the immutable balance cap. Inherits LSP8AllowlistAbstract constructor logic.
    /// @param tokenBalanceCap_ The maximum number of NFTs per address, 0 to disable.
    constructor(uint256 tokenBalanceCap_) {
        _TOKEN_BALANCE_CAP = tokenBalanceCap_;
    }

    /// @inheritdoc ILSP8CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _TOKEN_BALANCE_CAP;
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
    ) internal virtual {
        require(
            to == address(0) ||
                tokenBalanceCap() == 0 ||
                balanceOf(to) + 1 <= tokenBalanceCap(),
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
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (isAllowlisted(to)) return;
        _tokenBalanceCapCheck(from, to, tokenId, force, data);
    }
}
