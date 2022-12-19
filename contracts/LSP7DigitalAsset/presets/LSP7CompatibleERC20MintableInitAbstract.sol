// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// modules
import {LSP7CompatibleERC20InitAbstract} from "../extensions/LSP7CompatibleERC20InitAbstract.sol";

contract LSP7CompatibleERC20MintableInitAbstract is LSP7CompatibleERC20InitAbstract {
    /**
     * @inheritdoc LSP7CompatibleERC20InitAbstract
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP7CompatibleERC20InitAbstract._initialize(name_, symbol_, newOwner_);
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public onlyOwner {
        _mint(to, amount, force, data);
    }
}
