// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7AllowlistInitAbstract} from "../LSP7Allowlist/LSP7AllowlistInitAbstract.sol";

// interfaces
import {ILSP7CappedBalance} from "./ILSP7CappedBalance.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {LSP7CappedBalanceExceeded} from "./LSP7CappedBalanceErrors.sol";

/// @title LSP7CappedBalanceInitAbstract
/// @dev Abstract contract implementing a per-address balance cap for LSP7 tokens, with exemptions for allowlisted addresses. Inherits from LSP7AllowlistAbstract to integrate allowlist functionality.
abstract contract LSP7CappedBalanceInitAbstract is
    ILSP7CappedBalance,
    LSP7AllowlistInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The immutable maximum token balance allowed per address.
    uint256 private _tokenBalanceCap;

    /// @notice Initializes the contract with a token balance cap.
    /// @dev Sets the immutable balance cap and reverts if the cap is zero. Inherits LSP7AllowlistAbstract constructor logic.
    /// @param tokenBalanceCap_ The maximum balance per address in wei, 0 to disable.
    function __LSP7CappedBalance_init(
        uint256 tokenBalanceCap_
    ) internal virtual onlyInitializing {
        _tokenBalanceCap = tokenBalanceCap_;
    }

    /// @inheritdoc ILSP7CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _tokenBalanceCap;
    }

    /// @notice Checks if a token transfer complies with the balance cap.
    /// @dev The address(0) is not subject to balance cap checks as this address is used for burning tokens. Reverts with {LSP7CappedBalanceExceeded} if the recipient's balance after receiving tokens would exceed the maximum allowed balance.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    function _tokenBalanceCapCheck(
        address /* from */,
        address to,
        uint256 amount,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Allow burning
        if (to == address(0)) return;
        if (tokenBalanceCap() == 0) return;
        if (balanceOf(to) + amount <= tokenBalanceCap()) return;

        revert LSP7CappedBalanceExceeded(
            to,
            amount,
            balanceOf(to),
            tokenBalanceCap()
        );
    }

    /// @notice Hook called before a token transfer to enforce balance cap restrictions.
    /// @dev Bypasses balance cap checks for allowlisted recipients. Applies cap checks for non-allowlisted recipients.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    /// @param force Whether to force the transfer.
    /// @param data Additional data for the transfer.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (isAllowlisted(to)) return;
        _tokenBalanceCapCheck(from, to, amount, force, data);
    }
}
