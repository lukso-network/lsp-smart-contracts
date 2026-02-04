// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAssetInitAbstract} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7RevokableInitAbstract} from "../extensions/LSP7Revokable/LSP7RevokableInitAbstract.sol";

/**
 * @title LSP7DigitalAsset deployable preset contract (proxy version) with revokable functionality.
 * @dev Allows the token issuer (owner) and delegated revokers to revoke tokens from any holder
 * back to the owner, or burn tokens from any holder.
 *
 * Use cases include:
 * - Memberships: Revoke membership tokens when they expire or are terminated
 * - Role badges: Remove role badges from community members
 * - Compliance: Freeze or reverse tokens for regulatory requirements
 * - Vesting: Revoke unvested tokens if conditions are not met
 */
contract LSP7RevokableInit is LSP7RevokableInitAbstract {
    /// @dev initialize (= lock) base implementation contract on deployment
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializing a `LSP7RevokableInit` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract (implicitly a revoker).
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) external virtual initializer {
        __LSP7Revokable_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
    }

    /// @notice Mints `amount` of tokens and transfers them to `to`.
    /// @dev Only the contract owner can mint tokens.
    /// @param to The address to mint tokens for.
    /// @param amount The amount of tokens to mint.
    /// @param force Set to `true` to allow minting to addresses that don't implement LSP1.
    /// @param data Additional data to include in the transfer notification.
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, amount, force, data);
    }
}
