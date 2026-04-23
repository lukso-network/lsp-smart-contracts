// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

// extensions
import {
    LSP7BurnableInitAbstract
} from "../extensions/LSP7Burnable/LSP7BurnableInitAbstract.sol";
import {
    LSP7MintableInitAbstract
} from "../extensions/LSP7Mintable/LSP7MintableInitAbstract.sol";
import {
    LSP7CappedSupplyInitAbstract
} from "../extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol";
import {
    LSP7CappedBalanceInitAbstract
} from "../extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol";
import {
    LSP7NonTransferableInitAbstract
} from "../extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol";
import {
    LSP7RevokableInitAbstract
} from "../extensions/LSP7Revokable/LSP7RevokableInitAbstract.sol";

// constants
import {
    LSP7MintableParams,
    LSP7NonTransferableParams,
    LSP7CappedParams,
    LSP7RevokableParams
} from "./LSP7CustomizableTokenConstants.sol";

// errors
import {
    LSP7MintDisabled
} from "../extensions/LSP7Mintable/LSP7MintableErrors.sol";

/// @title LSP7CustomizableTokenInit
/// @dev A customizable LSP7 token implementing minting, balance caps, transfer restrictions, total supply cap and burning with role-based access control exemptions.
/// Implements {LSP7BurnableInitAbstract} to allow burning.
/// Implements {LSP7MintableInitAbstract} to allow minting.
/// Implements {LSP7CappedSupplyInitAbstract} to set balance caps.
/// Implements {LSP7CappedBalanceInitAbstract} to set balance caps.
/// Implements {LSP7NonTransferableInitAbstract} to restrict transfers.
/// Implement {LSP7RevokableInitAbstract} to allow revoking tokens.
contract LSP7CustomizableTokenInit is
    LSP7BurnableInitAbstract,
    LSP7MintableInitAbstract,
    LSP7CappedSupplyInitAbstract,
    LSP7CappedBalanceInitAbstract,
    LSP7NonTransferableInitAbstract,
    LSP7RevokableInitAbstract
{
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        LSP7MintableParams calldata mintableParams,
        LSP7NonTransferableParams calldata nonTransferableParams,
        LSP7CappedParams calldata cappedParams,
        LSP7RevokableParams calldata revokableParams
    ) external virtual initializer {
        __LSP7CustomizableToken_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            mintableParams,
            cappedParams,
            nonTransferableParams,
            revokableParams
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
    /// @param nonTransferableParams Deployment configuration for non-transferable feature (see above).
    /// @param revokableParams Deployment configuration for revokable feature (see above).
    function __LSP7CustomizableToken_init(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        LSP7MintableParams calldata mintableParams,
        LSP7CappedParams calldata cappedParams,
        LSP7NonTransferableParams calldata nonTransferableParams,
        LSP7RevokableParams calldata revokableParams
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init_unchained();
        __LSP7Mintable_init_unchained(mintableParams.isMintable);
        __LSP7CappedSupply_init_unchained(cappedParams.tokenSupplyCap);
        __LSP7CappedBalance_init_unchained(cappedParams.tokenBalanceCap);
        __LSP7NonTransferable_init_unchained(
            nonTransferableParams.transferLockStart,
            nonTransferableParams.transferLockEnd
        );
        __LSP7Revokable_init_unchained(revokableParams.isRevokable);

        if (mintableParams.initialMintAmount > 0) {
            _mint(newOwner_, mintableParams.initialMintAmount, true, "");
        }
    }

    /// @inheritdoc LSP7CappedSupplyInitAbstract
    /// @notice Returns the token supply cap.
    /// @dev If minting is enabled, returns the configured supply cap defining the maximum tokens that can be minted.
    /// If minting is disabled, returns the current total supply as the effective cap (no more tokens can be created).
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
        require(isMintable, LSP7MintDisabled());

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
        super._beforeTokenTransfer(from, to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(
            OwnableUpgradeable,
            LSP7MintableInitAbstract,
            LSP7CappedBalanceInitAbstract,
            LSP7NonTransferableInitAbstract,
            LSP7RevokableInitAbstract
        )
    {
        super._transferOwnership(newOwner);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP7DigitalAssetInitAbstract,
            LSP7MintableInitAbstract,
            LSP7CappedBalanceInitAbstract,
            LSP7NonTransferableInitAbstract,
            LSP7RevokableInitAbstract
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
