// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "./LSP7DigitalAsset.sol";
import {
    LSP7CappedSupplyAbstract
} from "./extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol";
import {LSP7Burnable} from "./extensions/LSP7Burnable.sol";
import {
    LSP7CappedBalanceAbstract
} from "./extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {
    LSP7MintableAbstract
} from "./extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {
    LSP7NonTransferableAbstract
} from "./extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol";
import {
    LSP7AllowlistAbstract
} from "./extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol";

// errors
import {
    LSP7MintDisabled
} from "./extensions/LSP7Mintable/LSP7MintableErrors.sol";

/// @title CustomizableToken
/// @dev A customizable LSP7 token implementing minting, balance caps, transfer restrictions, total supply cap, burning and allowlist exemptions.
/// Implements {LSP7Mintable} to allow minting.
/// Implements {LSP7Burnable} to allow burning
/// Implements {LSP7CappedBalance} to set balance caps.
/// Implements {LSP7NonTransferable} to restrict transfers.
/// Implements {LSP7CappedSupply} to set total supply cap.
/// Implements {LSP7Allowlist} to create allowlist exemptions
contract CustomizableToken is
    LSP7MintableAbstract,
    LSP7NonTransferableAbstract,
    LSP7CappedBalanceAbstract,
    LSP7CappedSupplyAbstract,
    LSP7Burnable
{
    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions, allowlist, and supply cap. Mints initial tokens if specified. Reverts if initialMintAmount_ exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token, added to the allowlist.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 0 for token).
    /// @param isNonDivisible_ True if the token is non-divisible (e.g., for NDTs).
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @param initialMintAmount_ The amount of tokens to mint to `newOwner_` on deployment in wei.
    /// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    /// @param tokenBalanceCap_ The maximum balance per address in wei, 0 to disable.
    /// @param tokenSupplyCap_ The maximum total supply in wei, 0 to disable.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_,
        uint256 initialMintAmount_,
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_,
        uint256 tokenBalanceCap_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7AllowlistAbstract(newOwner_)
        LSP7MintableAbstract(mintable_)
        LSP7NonTransferableAbstract(
            transferable_,
            transferLockStart_,
            transferLockEnd_
        )
        LSP7CappedBalanceAbstract(tokenBalanceCap_)
        LSP7CappedSupplyAbstract(tokenSupplyCap_)
    {
        if (initialMintAmount_ > 0) {
            _mint(newOwner_, initialMintAmount_, true, "");
        }
    }

    /// @inheritdoc LSP7CappedSupplyAbstract
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @inheritdoc LSP7MintableAbstract
    /// @dev Relies on {LSP7CappedSupply} for supply cap enforcement.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP7DigitalAsset,
            LSP7MintableAbstract,
            LSP7CappedSupplyAbstract
        )
    {
        if (!isMintable) {
            revert LSP7MintDisabled();
        }

        _tokenSupplyCapCheck(to, amount, force, data);

        super._mint(to, amount, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP7CappedBalance} and {LSP7NonTransferable}. Bypasses all checks for allowlisted senders (from {LSP7NonTransferable}) or recipients (from {LSP7CappedBalance}). Allows burning to address(0) regardless of restrictions.
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
        override(
            LSP7DigitalAsset,
            LSP7CappedBalanceAbstract,
            LSP7NonTransferableAbstract
        )
    {
        LSP7NonTransferableAbstract._beforeTokenTransfer(
            from,
            to,
            amount,
            force,
            data
        );
        LSP7CappedBalanceAbstract._beforeTokenTransfer(
            from,
            to,
            amount,
            force,
            data
        );
    }
}
