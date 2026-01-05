// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7CappedBalanceAbstract} from "../extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {LSP7AllowlistAbstract} from "../extensions/LSP7Allowlist/LSP7AllowlistAbstract.sol";

contract LSP7CappedBalance is LSP7CappedBalanceAbstract {
    /// @notice Deploying a `LSP7CappedBalance` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param tokenBalanceCap_ The maximum balance per address in wei, 0 to disable.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenBalanceCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7CappedBalanceAbstract(tokenBalanceCap_)
        LSP7AllowlistAbstract(newOwner_)
    {}
}
