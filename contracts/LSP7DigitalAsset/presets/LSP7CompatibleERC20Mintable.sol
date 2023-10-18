// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import {LSP7CompatibleERC20} from "../extensions/LSP7CompatibleERC20.sol";

/**
 * @title LSP7CompatibleERC20 deployable preset contract with a public {mint} function callable only by the contract {owner}.
 */
contract LSP7CompatibleERC20Mintable is LSP7CompatibleERC20 {
    /**
     * @notice Deploying a `LSP7CompatibleERC20Mintable` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7CompatibleERC20(name_, symbol_, newOwner_) {}

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
