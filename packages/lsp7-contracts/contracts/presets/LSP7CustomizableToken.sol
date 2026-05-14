// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    AccessControlExtendedAbstract
} from "../extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";

// extensions
import {LSP7Burnable} from "../extensions/LSP7Burnable/LSP7Burnable.sol";
import {
    LSP7MintableAbstract
} from "../extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {
    LSP7CappedSupplyAbstract
} from "../extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol";
import {
    LSP7CappedBalanceAbstract
} from "../extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {
    LSP7NonTransferableAbstract
} from "../extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol";
import {
    LSP7RevokableAbstract
} from "../extensions/LSP7Revokable/LSP7RevokableAbstract.sol";

// constants
import {
    LSP7MintableParams,
    LSP7CappedParams,
    LSP7NonTransferableParams,
    LSP7RevokableParams
} from "./LSP7CustomizableTokenConstants.sol";

// errors
import {
    LSP7MintDisabled
} from "../extensions/LSP7Mintable/LSP7MintableErrors.sol";
import {
    LSP7CappedSupplyCannotMintOverCap
} from "../extensions/LSP7CappedSupply/LSP7CappedSupplyErrors.sol";

/// @title LSP7CustomizableToken
/// @dev A customizable LSP7 token (proxy version) implementing minting, balance caps, transfer restrictions, total supply cap and burning with role-based access control exemptions.
/// Implements {LSP7Burnable} to allow burning.
/// Implements {LSP7Mintable} to allow minting.
/// Implements {LSP7CappedSupply} to set total supply cap.
/// Implements {LSP7CappedBalance} to set balance caps.
/// Implements {LSP7NonTransferable} to restrict transfers.
/// Implements {LSP7Revokable} to allow revoking tokens.
contract LSP7CustomizableToken is
    LSP7Burnable,
    LSP7MintableAbstract,
    LSP7CappedSupplyAbstract,
    LSP7CappedBalanceAbstract,
    LSP7NonTransferableAbstract,
    LSP7RevokableAbstract
{
    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions, allowlist, and supply cap. Mints initial tokens if specified. Reverts if initialMintAmount_ exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token, added to the allowlist.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 0 for token).
    /// @param isNonDivisible_ True if the token is non-divisible (e.g., for NDTs).
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    /// @param revokableParams Deployment configuration for revokable feature (see above).
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        LSP7MintableParams memory mintableParams,
        LSP7CappedParams memory cappedParams,
        LSP7NonTransferableParams memory nonTransferableParams,
        LSP7RevokableParams memory revokableParams
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7MintableAbstract(mintableParams.isMintable)
        LSP7CappedSupplyAbstract(cappedParams.tokenSupplyCap)
        LSP7CappedBalanceAbstract(cappedParams.tokenBalanceCap)
        LSP7NonTransferableAbstract(
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        )
        LSP7RevokableAbstract(revokableParams.isRevokable)
    {
        if (mintableParams.initialMintAmount > 0) {
            _initialMint({
                to: newOwner_,
                amount: mintableParams.initialMintAmount
            });
        }
    }

    /// @inheritdoc LSP7CappedSupplyAbstract
    /// @notice Returns the token supply cap.
    /// @dev If minting is enabled, returns the configured supply cap defining the maximum amount of tokens that can be minted.
    /// If minting is disabled, returns the current total supply as the effective cap (no more tokens can be created).
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @dev Override to bypass the non transferable check when revokers revoke users' tokens.
    function _nonTransferableCheck(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (
            msg.sig == this.revoke.selector &&
            isRevokable() &&
            hasRole(REVOKER_ROLE, msg.sender) &&
            (to == owner() || hasRole(REVOKER_ROLE, to))
        ) return;

        super._nonTransferableCheck(from, to, amount, force, data);
    }

    /// @inheritdoc LSP7MintableAbstract
    /// @dev Overriden function to allow minting only if:
    /// - the minting feature is enabled, from {LSP7MintableAbstract}
    /// - the total amount of tokens does not exceed the capped supply after minting, from {LSP7CappedSupplyAbstract}
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
        require(isMintable, LSP7MintDisabled());
        LSP7CappedSupplyAbstract._mint(to, amount, force, data);
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
        super._beforeTokenTransfer(from, to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(
            Ownable,
            LSP7MintableAbstract,
            LSP7CappedBalanceAbstract,
            LSP7NonTransferableAbstract,
            LSP7RevokableAbstract
        )
    {
        super._transferOwnership(newOwner);
    }

    /// @dev Mint initial tokens without enforcing check if the token contract is mintable or not.
    /// Enforces the configured capped-supply value directly before bypassing the mintable check.
    function _initialMint(address to, uint256 amount) private {
        uint256 configuredTokenSupplyCap = LSP7CappedSupplyAbstract
            .tokenSupplyCap();
        uint256 currentSupply = totalSupply();

        require(
            configuredTokenSupplyCap == 0 ||
                (currentSupply + amount) <= configuredTokenSupplyCap,
            LSP7CappedSupplyCannotMintOverCap()
        );
        LSP7DigitalAsset._mint(to, amount, true, "");
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP7DigitalAsset,
            LSP7MintableAbstract,
            LSP7CappedBalanceAbstract,
            LSP7NonTransferableAbstract,
            LSP7RevokableAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
