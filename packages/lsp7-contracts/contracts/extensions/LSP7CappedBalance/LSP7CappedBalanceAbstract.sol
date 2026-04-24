// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP7CappedBalance} from "./ILSP7CappedBalance.sol";

// errors
import {LSP7CappedBalanceExceeded} from "./LSP7CappedBalanceErrors.sol";

/// @title LSP7CappedBalanceAbstract
/// @dev Abstract contract implementing a per-address balance cap for LSP7 tokens, with role base access control and exemptions.
/// Inherits from LSP7AllowlistAbstract to integrate allowlist functionality.
abstract contract LSP7CappedBalanceAbstract is
    ILSP7CappedBalance,
    LSP7DigitalAsset,
    AccessControlExtendedAbstract
{
    /// @notice The dead address is also commonly used for burning tokens as an alternative to address(0).
    address internal constant _DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    /// @notice The immutable maximum token balance allowed per address.
    uint256 internal immutable _TOKEN_BALANCE_CAP;

    /// @dev `"UNCAPPED_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant UNCAPPED_ROLE =
        0x554e4341505045445f524f4c4500000000000000000000000000000000000000;

    /// @notice Initializes the contract with a token balance cap.
    /// @dev Sets the immutable balance cap. If set, grants the initial uncapped balance role exemption to the contract owner.
    /// @param tokenBalanceCap_ The maximum balance allowed per token holder (in wei). Set to 0 to disable.
    constructor(uint256 tokenBalanceCap_) {
        _TOKEN_BALANCE_CAP = tokenBalanceCap_;

        if (tokenBalanceCap_ != 0) {
            _grantRole(UNCAPPED_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP7CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _TOKEN_BALANCE_CAP;
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
        // Address(0) and 0x0000...dead addresses are used for burning tokens
        if (to == address(0) || to == _DEAD_ADDRESS) return;

        // Do not check for addresses exempted from balance cap
        if (hasRole(UNCAPPED_ROLE, to)) return;

        uint256 maxBalanceAllowed = tokenBalanceCap();
        bool isBalanceCapEnabled = maxBalanceAllowed != 0;

        if (!isBalanceCapEnabled) return;

        require(
            (balanceOf(to) + amount) <= maxBalanceAllowed,
            LSP7CappedBalanceExceeded(
                to,
                amount,
                balanceOf(to),
                maxBalanceAllowed
            )
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
        _tokenBalanceCapCheck(from, to, amount, force, data);
        super._beforeTokenTransfer(from, to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant UNCAPPED_ROLE to new accounts post-transfer
        _setRoleAdmin(UNCAPPED_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }
}
