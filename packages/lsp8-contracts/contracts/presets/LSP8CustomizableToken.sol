// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    AccessControlExtendedAbstract
} from "../extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

// extensions
import {LSP8Burnable} from "../extensions/LSP8Burnable/LSP8Burnable.sol";
import {
    LSP8MintableAbstract
} from "../extensions/LSP8Mintable/LSP8MintableAbstract.sol";
import {
    LSP8CappedSupplyAbstract
} from "../extensions/LSP8CappedSupply/LSP8CappedSupplyAbstract.sol";
import {
    LSP8CappedBalanceAbstract
} from "../extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol";
import {
    LSP8NonTransferableAbstract
} from "../extensions/LSP8NonTransferable/LSP8NonTransferableAbstract.sol";
import {
    LSP8RevokableAbstract
} from "../extensions/LSP8Revokable/LSP8RevokableAbstract.sol";

// constants
import {
    LSP8MintableParams,
    LSP8NonTransferableParams,
    LSP8CappedParams,
    LSP8RevokableParams
} from "./LSP8CustomizableTokenConstants.sol";

// errors
import {
    LSP8MintDisabled
} from "../extensions/LSP8Mintable/LSP8MintableErrors.sol";
import {
    LSP8CappedSupplyCannotMintOverCap
} from "../extensions/LSP8CappedSupply/LSP8CappedSupplyErrors.sol";

/// @title LSP8CustomizableToken
/// @dev A customizable LSP8 token implementing minting, balance caps, transfer restrictions, total supply cap, burning and role-based exemptions.
/// Implements {LSP8Burnable} to allow burning.
/// Implements {LSP8Mintable} to allow minting.
/// Implements {LSP8CappedSupply} to set total supply cap.
/// Implements {LSP8CappedBalance} to set balance caps.
/// Implements {LSP8NonTransferable} to restrict transfers.
/// Implements {LSP8Revokable} to allow revoking tokens.
contract LSP8CustomizableToken is
    LSP8Burnable,
    LSP8MintableAbstract,
    LSP8CappedSupplyAbstract,
    LSP8CappedBalanceAbstract,
    LSP8NonTransferableAbstract,
    LSP8RevokableAbstract
{
    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions and supply cap. Mints initial tokens if specified. Reverts if initialMintTokenIds length exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 1 for NFT, 2 for Collection).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    /// @param revokableParams Deployment configuration for revokable feature (see above).
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        LSP8MintableParams memory mintableParams,
        LSP8CappedParams memory cappedParams,
        LSP8NonTransferableParams memory nonTransferableParams,
        LSP8RevokableParams memory revokableParams
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8MintableAbstract(mintableParams.isMintable)
        LSP8CappedSupplyAbstract(cappedParams.tokenSupplyCap)
        LSP8CappedBalanceAbstract(cappedParams.tokenBalanceCap)
        LSP8NonTransferableAbstract(
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        )
        LSP8RevokableAbstract(revokableParams.isRevokable)
    {
        _initialMint({
            to: newOwner_,
            initialMintTokenIds: mintableParams.initialMintTokenIds
        });
    }

    /// @inheritdoc LSP8CappedSupplyAbstract
    /// @notice Returns the token supply cap.
    /// @dev If minting is enabled, returns the configured supply cap defining the maximum number of NFTs that can be minted.
    /// If minting is disabled, returns the current total supply as the effective cap (no more NFTs can be created).
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @dev Override to bypass the non transferable check when revokers revoke users' tokens.
    function _nonTransferableCheck(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (
            msg.sig == this.revoke.selector &&
            isRevokable() &&
            hasRole(REVOKER_ROLE, msg.sender) &&
            (to == owner() || hasRole(REVOKER_ROLE, to))
        ) return;

        super._nonTransferableCheck(from, to, tokenId, force, data);
    }

    /// @inheritdoc LSP8MintableAbstract
    /// @dev Overriden function to allow minting only if:
    /// - the minting feature is enabled, from {LSP8MintableAbstract}
    /// - the total number of NFTs does not exceed the capped supply after minting, from {LSP8CappedSupplyAbstract}
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8MintableAbstract,
            LSP8CappedSupplyAbstract
        )
    {
        require(isMintable, LSP8MintDisabled());
        LSP8CappedSupplyAbstract._mint(to, tokenId, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP8CappedBalance} and {LSP8NonTransferable}. Bypasses all checks for role holders configured by those extensions. Allows burning to address(0) regardless of restrictions.
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
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8CappedBalanceAbstract,
            LSP8NonTransferableAbstract
        )
    {
        super._beforeTokenTransfer(from, to, tokenId, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(
            Ownable,
            LSP8CappedBalanceAbstract,
            LSP8MintableAbstract,
            LSP8NonTransferableAbstract,
            LSP8RevokableAbstract
        )
    {
        super._transferOwnership(newOwner);
    }

    /// @dev Mint initial NFTs without enforcing check if the token contract is mintable or not.
    /// Enforces the configured capped-supply value directly (not {tokenSupplyCap} when minting is disabled).
    function _initialMint(
        address to,
        bytes32[] memory initialMintTokenIds
    ) private {
        uint256 configuredTokenSupplyCap = LSP8CappedSupplyAbstract
            .tokenSupplyCap();
        uint256 currentSupply = totalSupply();

        require(
            configuredTokenSupplyCap == 0 ||
                (currentSupply + initialMintTokenIds.length) <=
                configuredTokenSupplyCap,
            LSP8CappedSupplyCannotMintOverCap()
        );

        for (uint256 ii = 0; ii < initialMintTokenIds.length; ++ii) {
            LSP8IdentifiableDigitalAsset._mint(
                to,
                initialMintTokenIds[ii],
                true,
                ""
            );
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8IdentifiableDigitalAsset,
            LSP8CappedBalanceAbstract,
            LSP8MintableAbstract,
            LSP8NonTransferableAbstract,
            LSP8RevokableAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
