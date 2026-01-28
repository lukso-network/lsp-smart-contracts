// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "./LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8CappedSupplyInitAbstract} from "./extensions/LSP8CappedSupply/LSP8CappedSupplyInitAbstract.sol";
import {LSP8BurnableInitAbstract} from "./extensions/LSP8BurnableInitAbstract.sol";
import {LSP8CappedBalanceInitAbstract} from "./extensions/LSP8CappedBalance/LSP8CappedBalanceInitAbstract.sol";
import {LSP8MintableInitAbstract} from "./extensions/LSP8Mintable/LSP8MintableInitAbstract.sol";
import {LSP8NonTransferableInitAbstract} from "./extensions/LSP8NonTransferable/LSP8NonTransferableInitAbstract.sol";
import {LSP8AllowlistInitAbstract} from "./extensions/LSP8Allowlist/LSP8AllowlistInitAbstract.sol";

// errors
import {LSP8MintDisabled} from "./extensions/LSP8Mintable/LSP8MintableErrors.sol";

/// @dev Deployment configuration for minting feature.
/// @param mintable True to enable minting after deployment, false to disable it forever.
/// @param initialMintTokenIds Array of tokenIds to mint to `newOwner_` on deployment.
struct MintableParamsInit {
    bool mintable;
    bytes32[] initialMintTokenIds;
}

/// @dev Deployment configuration for non-transferable feature.
/// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
/// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
/// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
struct NonTransferableParamsInit {
    bool transferable;
    uint256 transferLockStart;
    uint256 transferLockEnd;
}

/// @dev Deployment configuration for capped balance and capped supply features.
/// @param tokenBalanceCap The maximum number of NFTs per address, 0 to disable.
/// @param tokenSupplyCap The maximum total supply of NFTs, 0 to disable.
struct CappedParamsInit {
    uint256 tokenBalanceCap;
    uint256 tokenSupplyCap;
}

/// @title CustomizableTokenInit
/// @dev A customizable LSP8 token implementing minting, balance caps, transfer restrictions, total supply cap, burning and allowlist exemptions. This is the proxy-deployable version.
/// Implements {LSP8Mintable} to allow minting.
/// Implements {LSP8Burnable} to allow burning
/// Implements {LSP8CappedBalance} to set balance caps.
/// Implements {LSP8NonTransferable} to restrict transfers.
/// Implements {LSP8CappedSupply} to set total supply cap.
/// Implements {LSP8Allowlist} to create allowlist exemptions
contract CustomizableTokenInit is
    LSP8MintableInitAbstract,
    LSP8NonTransferableInitAbstract,
    LSP8CappedBalanceInitAbstract,
    LSP8CappedSupplyInitAbstract,
    LSP8BurnableInitAbstract
{
    /// @dev Locks the base implementation contract from being initialized.
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions, allowlist, and supply cap. Mints initial tokens if specified. Reverts if initialMintTokenIds length exceeds tokenSupplyCap.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token, added to the allowlist.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 1 for NFT, 2 for Collection).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        MintableParamsInit memory mintableParams,
        NonTransferableParamsInit memory nonTransferableParams,
        CappedParamsInit memory cappedParams
    ) external virtual initializer {
        __CustomizableToken_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
    }

    /// @dev Internal initialization function.
    function __CustomizableToken_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        MintableParamsInit memory mintableParams,
        NonTransferableParamsInit memory nonTransferableParams,
        CappedParamsInit memory cappedParams
    ) internal virtual onlyInitializing {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __LSP8Allowlist_init_unchained(newOwner_);
        __LSP8Mintable_init_unchained(mintableParams.mintable);
        __LSP8NonTransferable_init_unchained(
            nonTransferableParams.transferable,
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        );
        __LSP8CappedBalance_init_unchained(cappedParams.tokenBalanceCap);
        __LSP8CappedSupply_init_unchained(cappedParams.tokenSupplyCap);

        // Mint initial tokens
        for (
            uint256 i = 0;
            i < mintableParams.initialMintTokenIds.length;
            i++
        ) {
            _mint(newOwner_, mintableParams.initialMintTokenIds[i], true, "");
        }
    }

    /// @inheritdoc LSP8CappedSupplyInitAbstract
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @inheritdoc LSP8MintableInitAbstract
    /// @dev Relies on {LSP8CappedSupply} for supply cap enforcement.
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
        if (!isMintable) {
            revert LSP8MintDisabled();
        }

        _tokenSupplyCapCheck(to, tokenId, force, data);

        LSP8IdentifiableDigitalAssetInitAbstract._mint(
            to,
            tokenId,
            force,
            data
        );
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP8CappedBalance} and {LSP8NonTransferable}. Bypasses all checks for allowlisted senders (from {LSP8NonTransferable}) or recipients (from {LSP8CappedBalance}). Allows burning to address(0) regardless of restrictions.
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
        LSP8NonTransferableInitAbstract._beforeTokenTransfer(
            from,
            to,
            tokenId,
            force,
            data
        );
        LSP8CappedBalanceInitAbstract._beforeTokenTransfer(
            from,
            to,
            tokenId,
            force,
            data
        );
    }
}
