// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {
    LSP8CompatibleERC721MintableInitAbstract
} from "./LSP8CompatibleERC721MintableInitAbstract.sol";

/**
 * @title LSP8CompatibleERC721MintableInit deployable preset contract (proxy version) with a public mint function callable only by the contract {owner}
 */
contract LSP8CompatibleERC721MintableInit is
    LSP8CompatibleERC721MintableInitAbstract
{
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP8CompatibleERC721MintableInit` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `contractOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param contractOwner_ The address that can set metadata via {`setData`} and {`setDataBatch`} on the token contract and transfer or renounce ownership of the token contract..
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address contractOwner_,
        uint256 tokenIdType_
    ) external virtual initializer {
        LSP8CompatibleERC721MintableInitAbstract._initialize(
            name_,
            symbol_,
            contractOwner_,
            tokenIdType_
        );
    }
}
