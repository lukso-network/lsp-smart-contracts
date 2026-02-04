// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7MintableAbstract} from "../extensions/LSP7Mintable/LSP7MintableAbstract.sol";

/**
 * @title LSP7DigitalAsset deployable preset contract with a public {mint} function callable only by the contract {owner}.
 */
contract LSP7Mintable is LSP7MintableAbstract {
    /// @notice Deploying a `LSP7Mintable` token contract.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param mintable_ True to enable minting initially, false to disable it.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_) LSP7MintableAbstract(mintable_) {}
}
