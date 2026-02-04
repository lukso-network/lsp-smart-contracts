// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAssetInitAbstract} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7CappedBalanceInitAbstract} from "../extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol";

contract LSP7CappedBalanceInit is LSP7CappedBalanceInitAbstract {
    /// @dev initialize (= lock) base implementation contract on deployment
    constructor() {
        _disableInitializers();
    }

    /// @notice Deploying a `LSP7CappedBalanceInit` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param tokenBalanceCap_ The maximum balance per address in wei, 0 to disable.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenBalanceCap_
    ) external virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_);
        __LSP7CappedBalance_init_unchained(tokenBalanceCap_);
        __LSP7Allowlist_init_unchained(newOwner_);
    }
}
