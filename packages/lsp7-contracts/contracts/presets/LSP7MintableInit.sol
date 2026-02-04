// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAssetInitAbstract} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7MintableInitAbstract} from "../extensions/LSP7Mintable/LSP7MintableInitAbstract.sol";

/**
 * @dev LSP7DigitalAsset deployable preset contract (proxy version) with a public {mint} function callable only by the contract {owner}.
 */
contract LSP7MintableInit is LSP7MintableInitAbstract {
    /// @dev initialize (= lock) base implementation contract on deployment
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializing a `LSP7MintableInit` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param mintable_ True to enable minting initially, false to disable it.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    ) external virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_);
        __LSP7Mintable_init_unchained(mintable_);
    }
}
