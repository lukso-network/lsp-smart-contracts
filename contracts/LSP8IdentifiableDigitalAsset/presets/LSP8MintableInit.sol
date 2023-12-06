// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {LSP8MintableInitAbstract} from "./LSP8MintableInitAbstract.sol";

/**
 * @dev LSP8IdentifiableDigitalAsset deployable preset contract (proxy version) with a public {mint} function callable only by the contract {owner}.
 */
contract LSP8MintableInit is LSP8MintableInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP8MintableInit` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    ) external virtual initializer {
        LSP8MintableInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
    }
}
