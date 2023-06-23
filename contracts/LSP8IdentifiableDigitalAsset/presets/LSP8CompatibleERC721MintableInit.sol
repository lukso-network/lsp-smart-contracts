// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// modules
import {
    LSP8CompatibleERC721MintableInitAbstract
} from "./LSP8CompatibleERC721MintableInitAbstract.sol";

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
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) external virtual initializer {
        LSP8CompatibleERC721MintableInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_
        );
    }
}
