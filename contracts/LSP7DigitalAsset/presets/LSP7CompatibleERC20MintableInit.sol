// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

// modules
import {
    LSP7CompatibleERC20MintableInitAbstract
} from "./LSP7CompatibleERC20MintableInitAbstract.sol";

/**
 * @title LSP7 deployable preset contract (proxy version) with a public mint function callable only by the contract {owner}
 */
contract LSP7CompatibleERC20MintableInit is
    LSP7CompatibleERC20MintableInitAbstract
{
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP7CompatibleERC20MintableInit` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) external virtual initializer {
        LSP7CompatibleERC20MintableInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_
        );
    }
}
