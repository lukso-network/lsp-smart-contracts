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
        AccessControlExtendedAbstract(newOwner_)
        LSP8MintableAbstract(true)
    {}
}
