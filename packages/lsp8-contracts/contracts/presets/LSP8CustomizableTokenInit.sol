// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";

// extensions
import {
    LSP8BurnableInitAbstract
} from "../extensions/LSP8Burnable/LSP8BurnableInitAbstract.sol";
import {
    LSP8MintableInitAbstract
} from "../extensions/LSP8Mintable/LSP8MintableInitAbstract.sol";
import {
    LSP8CappedSupplyInitAbstract
} from "../extensions/LSP8CappedSupply/LSP8CappedSupplyInitAbstract.sol";
import {
    LSP8CappedBalanceInitAbstract
} from "../extensions/LSP8CappedBalance/LSP8CappedBalanceInitAbstract.sol";
import {
    LSP8NonTransferableInitAbstract
} from "../extensions/LSP8NonTransferable/LSP8NonTransferableInitAbstract.sol";
import {
    LSP8RevokableInitAbstract
} from "../extensions/LSP8Revokable/LSP8RevokableInitAbstract.sol";

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

/// @title LSP8CustomizableTokenInit
/// @dev A customizable LSP8 token that implements multiple features and uses role-based exemptions. This version of the contract is the implementation to use behind proxies.
/// Implements {LSP8BurnableInitAbstract} to allow burning.
/// Implements {LSP8MintableInitAbstract} to allow minting.
/// Implements {LSP8CappedSupplyInitAbstract} to set total supply cap.
/// Implements {LSP8CappedBalanceInitAbstract} to set balance caps.
/// Implements {LSP8NonTransferableInitAbstract} to restrict transfers.
/// Implements {LSP8RevokableInitAbstract} to allow revoking tokens.
contract LSP8CustomizableTokenInit is
    LSP8BurnableInitAbstract,
    LSP8MintableInitAbstract,
    LSP8CappedBalanceInitAbstract,
    LSP8CappedSupplyInitAbstract,
    LSP8NonTransferableInitAbstract,
    LSP8RevokableInitAbstract
{
    /// @dev Locks the base implementation contract from being initialized.
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions and supply cap. Mints initial tokens if specified. Reverts if initialMintTokenIds length exceeds tokenSupplyCap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 1 for NFT, 2 for Collection).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        LSP8MintableParams calldata mintableParams,
        LSP8CappedParams calldata cappedParams,
        LSP8NonTransferableParams calldata nonTransferableParams,
        LSP8RevokableParams calldata revokableParams
    ) external virtual initializer {
        __LSP8CustomizableToken_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
        );
    }

    /// @dev Internal initialization function.
    function __LSP8CustomizableToken_init(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        LSP8MintableParams calldata mintableParams,
        LSP8CappedParams calldata cappedParams,
        LSP8NonTransferableParams calldata nonTransferableParams,
        LSP8RevokableParams calldata revokableParams
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __AccessControlExtended_init_unchained();
        __LSP8Mintable_init_unchained(mintableParams.isMintable);
        __LSP8CappedSupply_init_unchained(cappedParams.tokenSupplyCap);
        __LSP8CappedBalance_init_unchained(cappedParams.tokenBalanceCap);
        __LSP8NonTransferable_init_unchained(
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        );
        __LSP8Revokable_init_unchained(revokableParams.isRevokable);

        _initialMint({
            to: newOwner_,
            initialMintTokenIds: mintableParams.initialMintTokenIds
        });
    }

    /// @inheritdoc LSP8CappedSupplyInitAbstract
    /// @notice Returns the token supply cap.
    /// @dev If minting is enabled, returns the configured supply cap defining the maximum number of NFTs that can be minted.
    /// If minting is disabled, returns the current total supply as the effective cap (no more NFTs can be created).
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @dev Required override to resolve multiple inheritance. Calls every parent {supportsInterface} functions
    /// via `super` to aggregate the interface IDs supported across all inherited modules.
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8IdentifiableDigitalAssetInitAbstract,
            LSP8MintableInitAbstract,
            LSP8CappedBalanceInitAbstract,
            LSP8NonTransferableInitAbstract,
            LSP8RevokableInitAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Override to bypass the non transferable check when revokers revoke users' tokens.
    function _nonTransferableCheck(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (_isRevocationBypass(to)) return;
        super._nonTransferableCheck(from, to, tokenId, force, data);
    }

    /// @dev Override to bypass the token balance cap check when revokers revoke users' tokens.
    function _tokenBalanceCapCheck(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (_isRevocationBypass(to)) return;
        super._tokenBalanceCapCheck(from, to, tokenId, force, data);
    }

    /// @inheritdoc LSP8MintableInitAbstract
    /// @dev Overridden function to allow minting only if:
    /// - the minting feature is enabled, from {LSP8MintableInitAbstract}
    /// - the total number of NFTs does not exceed the capped supply after minting, from {LSP8CappedSupplyInitAbstract}
    function _mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP8IdentifiableDigitalAssetInitAbstract,
            LSP8MintableInitAbstract,
            LSP8CappedSupplyInitAbstract
        )
    {
        require(isMintable, LSP8MintDisabled());
        LSP8CappedSupplyInitAbstract._mint(to, tokenId, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP8CappedBalanceInitAbstract} and {LSP8NonTransferableInitAbstract}.
    /// - Bypasses {LSP8NonTransferableInitAbstract} checks for senders (`from`) holding the `NON_TRANSFERABLE_BYPASS_ROLE` role.
    /// - Bypasses {LSP8CappedBalanceInitAbstract} checks for recipients (`to`) holding the `UNCAPPED_BALANCE_ROLE` role.
    /// - Allows minting (from address(0)) and burning to address(0) regardless of restrictions.
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
            LSP8IdentifiableDigitalAssetInitAbstract,
            LSP8CappedBalanceInitAbstract,
            LSP8NonTransferableInitAbstract
        )
    {
        super._beforeTokenTransfer(from, to, tokenId, force, data);
    }

    /// @dev Required override to resolve multiple inheritance. Calls every parent {_transferOwnership} function
    /// via `super` so that each inherited module updates its ownership-dependent state.
    ///
    /// When contract ownership changes, this will:
    /// - clear the admin role for: `MINTER_ROLE`, `REVOKER_ROLE`, `NON_TRANSFERABLE_BYPASS_ROLE`, `UNCAPPED_BALANCE_ROLE`
    /// - clear the list of addresses holding the `REVOKER_ROLE`
    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(
            OwnableUpgradeable,
            LSP8MintableInitAbstract,
            LSP8CappedBalanceInitAbstract,
            LSP8NonTransferableInitAbstract,
            LSP8RevokableInitAbstract
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
        uint256 configuredTokenSupplyCap = LSP8CappedSupplyInitAbstract
            .tokenSupplyCap();
        bool isCappedSupplyConfigured = configuredTokenSupplyCap > 0;

        if (isCappedSupplyConfigured) {
            bool mintingExceedsSupplyCap = initialMintTokenIds.length >
                configuredTokenSupplyCap;

            require(
                !mintingExceedsSupplyCap,
                LSP8CappedSupplyCannotMintOverCap()
            );
        }
        for (uint256 ii = 0; ii < initialMintTokenIds.length; ++ii) {
            LSP8IdentifiableDigitalAssetInitAbstract._mint(
                to,
                initialMintTokenIds[ii],
                true,
                ""
            );

            if (isCappedSupplyConfigured) {
                // CHECK if the `to` address is a contract that minted more tokens
                // through its `universalReceiver(...)` function after being notified via LSP1.
                bool currentSupplyExceedsSupplyCap = totalSupply() >
                    configuredTokenSupplyCap;

                require(
                    !currentSupplyExceedsSupplyCap,
                    LSP8CappedSupplyCannotMintOverCap()
                );
            }
        }
    }

    /// @dev Returns whether the current call is a legitimate revocation that should bypass the
    /// {LSP8NonTransferableInitAbstract} and {LSP8CappedBalanceInitAbstract} restrictions when revoking tokens from a token holder.
    ///
    /// Returns `true` only when all of the following conditions are met:
    /// - the function being called is {revoke}.
    /// - the revoking feature is enabled.
    /// - the caller (`msg.sender`) holds the `REVOKER_ROLE`.
    /// - the recipient (`to`) is either the contract `owner()` or a revoker (an address holding the `REVOKER_ROLE`).
    function _isRevocationBypass(address to) private view returns (bool) {
        return
            msg.sig == this.revoke.selector &&
            isRevokable() &&
            hasRole(REVOKER_ROLE, msg.sender) &&
            (to == owner() || hasRole(REVOKER_ROLE, to));
    }
}
