// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

// modules
import {
    LSP7CompatibleERC20InitAbstract
} from "../extensions/LSP7CompatibleERC20InitAbstract.sol";

/**
 * @title LSP7 preset contract (inheritable proxy version) with a public mint function callable only by the contract {owner}
 */
abstract contract LSP7CompatibleERC20MintableInitAbstract is
    LSP7CompatibleERC20InitAbstract
{
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

    /**
     * @dev Public {_mint} function only callable by the {owner}.
     */
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, amount, force, data);
    }
}
