// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";
import {
    LSP7MintableInitAbstract
} from "../extensions/LSP7Mintable/LSP7MintableInitAbstract.sol";

/**
 * @dev LSP7DigitalAsset deployable preset contract (proxy version) with a public {mint} function callable by addresses holding `MINTER_ROLE`.
 */
contract LSP7MintableInit is LSP7MintableInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP7MintableInit` token contract.
     * @dev Set the token to be mintable to allow minting more tokens after deployment.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param isNonDivisible_ Specify if the LSP7 token is divisible (decimals = 18) or non-divisible (decimals = 0)
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) external virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init();
        __LSP7Mintable_init_unchained(true);
    }
}
