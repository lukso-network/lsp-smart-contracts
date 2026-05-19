// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8MintableAbstract
} from "../extensions/LSP8Mintable/LSP8MintableAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";

/**
 * @title LSP8IdentifiableDigitalAsset deployable preset contract with a public {mint} function callable by addresses holding `MINTER_ROLE`.
 */
contract LSP8Mintable is LSP8MintableAbstract {
    /**
     * @notice Deploying a `LSP8Mintable` token contract.
     * @dev Set the token to be mintable to allow minting more tokens after deployment.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8MintableAbstract(true)
    {}
}
