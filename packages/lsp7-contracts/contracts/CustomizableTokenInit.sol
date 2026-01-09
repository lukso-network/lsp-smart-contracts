// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAssetInitAbstract} from "./LSP7DigitalAssetInitAbstract.sol";
import {LSP7MintableInitAbstract} from "./extensions/LSP7Mintable/LSP7MintableInitAbstract.sol";
import {LSP7NonTransferableInitAbstract} from "./extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol";
import {LSP7CappedBalanceInitAbstract} from "./extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol";
import {LSP7CappedSupplyInitAbstract} from "./extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol";
import {LSP7BurnableInitAbstract} from "./extensions/LSP7BurnableInitAbstract.sol";
import {LSP7AllowlistInitAbstract} from "./extensions/LSP7Allowlist/LSP7AllowlistInitAbstract.sol";
import {
    LSP4DigitalAssetMetadataInitAbstract,
    ERC725YInitAbstract
} from "@lukso/lsp4-contracts/contracts/LSP4DigitalAssetMetadataInitAbstract.sol";

// errors
import {LSP7MintDisabled} from "./extensions/LSP7Mintable/LSP7MintableErrors.sol";

/// @dev Deployment configuration for minting feature.
/// @param mintable True to enable minting after deployment, false to disable it forever.
/// @param initialMintAmount The amount of tokens to mint to `newOwner_` on deployment in wei.
struct MintableParams {
    bool mintable;
    uint256 initialMintAmount;
}

/// @dev Deployment configuration for non-transferable feature.
/// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
/// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
/// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
struct NonTransferableParams {
    bool transferable;
    uint256 transferLockStart;
    uint256 transferLockEnd;
}

/// @dev Deployment configuration for capped balance and capped supply features.
/// @param tokenBalanceCap The maximum balance per address in wei, 0 to disable.
/// @param tokenSupplyCap The maximum total supply in wei, 0 to disable.
struct CappedParams {
    uint256 tokenBalanceCap;
    uint256 tokenSupplyCap;
}

/// @title CustomizableToken
/// @dev A customizable LSP7 token implementing minting, balance caps, transfer restrictions, total supply cap, burning and allowlist exemptions.
/// Implements {LSP7MintableInitAbstract} to allow minting.
/// Implements {LSP7BurnableInitAbstract} to allow burning
/// Implements {LSP7CappedBalanceInitAbstract} to restrict transfers.
/// Implements {LSP7CappedSupplyInitAbstract} to set balance caps.
/// Implements {LSP7BurnableInitAbstract} to set total supply cap.
/// Implements {LSP7AllowlistInitAbstract} to create allowlist exemptions
contract CustomizableTokenInit is
    LSP7MintableInitAbstract,
    LSP7NonTransferableInitAbstract,
    LSP7CappedBalanceInitAbstract,
    LSP7CappedSupplyInitAbstract,
    LSP7BurnableInitAbstract
{
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        MintableParams memory mintableParams,
        NonTransferableParams memory nonTransferableParams,
        CappedParams memory cappedParams
    ) external virtual initializer {
        __CustomizableToken_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            mintableParams,
            nonTransferableParams,
            cappedParams
        );
    }

    /// @notice Initializes the token with name, symbol, owner, and customizable features.
    /// @dev Sets up minting, balance cap, transfer restrictions, allowlist, and supply cap. Mints initial tokens if specified. Reverts if initialMintAmount_ exceeds tokenSupplyCap. Inherits constructor logic from parent contracts.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The initial owner of the token, added to the allowlist.
    /// @param lsp4TokenType_ The LSP4 token type (e.g., 0 for token).
    /// @param isNonDivisible_ True if the token is non-divisible (e.g., for NDTs).
    /// @param mintableParams Deployment configuration for minting feature (see above).
    /// @param cappedParams Deployment configuration for capped balance and capped supply features (see above).
    function __CustomizableToken_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        MintableParams memory mintableParams,
        NonTransferableParams memory nonTransferableParams,
        CappedParams memory cappedParams
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __LSP7Allowlist_init(newOwner_);
        __LSP7Mintable_init(mintableParams.mintable);
        __LSP7NonTransferable_init(
            nonTransferableParams.transferable,
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        );
        __LSP7CappedBalance_init(cappedParams.tokenBalanceCap);
        __LSP7CappedSupply_init(cappedParams.tokenSupplyCap);
        if (mintableParams.initialMintAmount > 0) {
            _mint(newOwner_, mintableParams.initialMintAmount, true, "");
        }
    }

    /// @inheritdoc LSP7CappedSupplyInitAbstract
    function tokenSupplyCap() public view virtual override returns (uint256) {
        return isMintable ? super.tokenSupplyCap() : totalSupply();
    }

    /// @inheritdoc LSP7MintableInitAbstract
    /// @dev Relies on {LSP7CappedSupplyInitAbstract} for supply cap enforcement.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(
            LSP7DigitalAssetInitAbstract,
            LSP7MintableInitAbstract,
            LSP7CappedSupplyInitAbstract
        )
    {
        if (!isMintable) {
            revert LSP7MintDisabled();
        }

        _tokenSupplyCapCheck(to, amount, force, data);

        super._mint(to, amount, force, data);
    }

    /// @notice Hook called before a token transfer to enforce restrictions.
    /// @dev Combines checks from {LSP7CappedBalanceInitAbstract} and {LSP7NonTransferableInitAbstract}. Bypasses all checks for allowlisted senders (from {LSP7NonTransferableInitAbstract}) or recipients (from {LSP7CappedBalanceInitAbstract}). Allows burning to address(0) regardless of restrictions.
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
            LSP7DigitalAssetInitAbstract,
            LSP7NonTransferableInitAbstract,
            LSP7CappedBalanceInitAbstract
        )
    {
        LSP7NonTransferableInitAbstract._beforeTokenTransfer(
            from,
            to,
            amount,
            force,
            data
        );
        LSP7CappedBalanceInitAbstract._beforeTokenTransfer(
            from,
            to,
            amount,
            force,
            data
        );
    }
}
