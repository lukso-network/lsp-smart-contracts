// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7RevokableAbstract} from "../extensions/LSP7Revokable/LSP7RevokableAbstract.sol";

/**
 * @title LSP7DigitalAsset deployable preset contract with revokable functionality.
 * @dev Allows the token issuer (owner) and delegated revokers to revoke tokens from any holder
 * back to the owner, or burn tokens from any holder.
 *
 * Use cases include:
 * - Memberships: Revoke membership tokens when they expire or are terminated
 * - Role badges: Remove role badges from community members
 * - Compliance: Freeze or reverse tokens for regulatory requirements
 * - Vesting: Revoke unvested tokens if conditions are not met
 */
contract LSP7Revokable is LSP7RevokableAbstract {
    /// @notice Deploying a `LSP7Revokable` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract (implicitly a revoker).
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
    {}

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
