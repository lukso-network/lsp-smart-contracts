// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7CappedSupplyAbstract} from "../extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol";

contract LSP7CappedSupply is LSP7CappedSupplyAbstract {
    /// @notice Deploying a `LSP7CappedSupply` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param tokenSupplyCap_ The maximum total supply in wei, 0 to disable.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_)
        LSP7CappedSupplyAbstract(tokenSupplyCap_)
    {}
}
