// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {
    LSP7CompatibleERC20MintableInitAbstract
} from "./LSP7CompatibleERC20MintableInitAbstract.sol";

contract LSP7CompatibleERC20MintableInit is LSP7CompatibleERC20MintableInitAbstract {
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
    ) public virtual initializer {
        LSP7CompatibleERC20MintableInitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
