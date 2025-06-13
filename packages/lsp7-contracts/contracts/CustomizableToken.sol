// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "./LSP7DigitalAsset.sol";
import {LSP7CappedSupply} from "./extensions/LSP7CappedSupply.sol";
import {LSP7Burnable} from "./extensions/LSP7Burnable.sol";
import {LSP7CappedBalance} from "./customizable/LSP7CappedBalance.sol";
import {LSP7Mintable} from "./customizable/LSP7Mintable.sol";
import {LSP7NonTransferable} from "./customizable/LSP7NonTransferable.sol";
import {LSP7Allowlist} from "./customizable/LSP7Allowlist.sol";

// errors
import {LSP7MintDisabled} from "./customizable/LSP7MintableErrors.sol";

/// @title CustomizableToken
/// @dev A customizable LSP7 token implementing minting, balance caps, transfer restrictions, and allowlist exemptions. Inherits from LSP7Mintable, LSP7CappedBalance, LSP7NonTransferable, LSP7CappedSupply and LSP7Burnable to provide comprehensive token functionality.
contract CustomizableToken is
    LSP7Mintable,
    LSP7CappedBalance,
    LSP7NonTransferable,
    LSP7CappedSupply,
    LSP7Burnable
{
    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions, allowlist, and supply cap. Mints initial tokens if specified. Reverts if initialMintAmount_ exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token, added to the allowlist.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 0 for token).
    /// @param isNonDivisible_ True if the token is non-divisible (e.g., for NFTs).
    /// @param initialMintAmount_ The amount of tokens to mint to newOwner_ initially.
    /// @param tokenBalanceCap_ The maximum balance per address (0 for no cap).
    /// @param mintable_ True to enable minting initially, false to disable it.
    /// @param transferable_ True to enable transfers initially, false to enforce restrictions.
    /// @param nonTransferableFrom_ The start timestamp of the transfer lock period.
    /// @param nonTransferableUntil_ The end timestamp of the transfer lock period.
    /// @param tokenSupplyCap_ The maximum total supply (0 for unlimited).
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 initialMintAmount_,
        uint256 tokenBalanceCap_,
        bool mintable_,
        bool transferable_,
        uint256 nonTransferableFrom_,
        uint256 nonTransferableUntil_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7Allowlist(newOwner_)
        LSP7CappedBalance(tokenBalanceCap_)
        LSP7Mintable(mintable_)
        LSP7NonTransferable(
            transferable_,
            nonTransferableFrom_,
            nonTransferableUntil_
        )
        LSP7CappedSupply(tokenSupplyCap_)
    {
        if (tokenSupplyCap_ != 0 && initialMintAmount_ > tokenSupplyCap_) {
            revert LSP7CappedSupplyCannotMintOverCap();
        }

        if (initialMintAmount_ > 0) {
            _mint(newOwner_, initialMintAmount_, true, "");
        }
    }

    /// @inheritdoc LSP7CappedSupply
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return mintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @inheritdoc LSP7Mintable
    /// @dev Relies on LSP7CappedSupply for supply cap enforcement.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(LSP7Mintable, LSP7CappedSupply, LSP7DigitalAsset)
    {
        if (!mintable) {
            revert LSP7MintDisabled();
        }

        if (totalSupply() + amount > tokenSupplyCap()) {
            revert LSP7CappedSupplyCannotMintOverCap();
        }

        super._mint(to, amount, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from LSP7CappedBalance and LSP7NonTransferable. Bypasses all checks for allowlisted senders (from LSP7NonTransferable) or recipients (from LSP7CappedBalance). Allows burning to address(0) regardless of restrictions.
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
    )
        internal
        virtual
        override(LSP7DigitalAsset, LSP7CappedBalance, LSP7NonTransferable)
    {
        LSP7NonTransferable._beforeTokenTransfer(from, to, amount, force, data);
        LSP7CappedBalance._beforeTokenTransfer(from, to, amount, force, data);
    }
}
