// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {LSP7CompatibilityForERC20InitAbstract} from "../extensions/LSP7CompatibilityForERC20InitAbstract.sol";

contract LSP7CompatibilityForERC20MintableInitAbstract is LSP7CompatibilityForERC20InitAbstract {
    /**
     * @inheritdoc LSP7CompatibilityForERC20InitAbstract
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP7CompatibilityForERC20InitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
