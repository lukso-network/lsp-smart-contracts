// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7CompatibilityForERC20InitAbstract} from "./LSP7CompatibilityForERC20InitAbstract.sol";

contract LSP7CompatibilityForERC20Init is LSP7CompatibilityForERC20InitAbstract {
    /**
     * @dev initialize the base (= implementation) contract
     */
    constructor() initializer {}

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
        LSP7CompatibilityForERC20InitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
