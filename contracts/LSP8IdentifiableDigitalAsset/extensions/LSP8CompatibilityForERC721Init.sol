// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8CompatibilityForERC721InitAbstract} from "./LSP8CompatibilityForERC721InitAbstract.sol";

/**
 * @dev LSP8 extension, for compatibility for clients / tools that expect ERC721.
 */
contract LSP8CompatibilityForERC721Init is LSP8CompatibilityForERC721InitAbstract {
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
    ) public virtual initializer {
        LSP8CompatibilityForERC721InitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
