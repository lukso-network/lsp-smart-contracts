// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7MintableInitAbstract} from "./LSP7MintableInitAbstract.sol";

/**
 * @dev LSP7DigitalAsset deployable preset contract (proxy version) with a public {mint} function callable only by the contract {owner}.
 */
contract LSP7MintableInit is LSP7MintableInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a `LSP7MintableInit` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `contractOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param contractOwner_ The address that can mint new tokens and set metadata via {`setData`} and {`setDataBatch`} on the token contract and transfer or renounce ownership of the token contract..
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address contractOwner_,
        bool isNonDivisible_
    ) external virtual initializer {
        LSP7MintableInitAbstract._initialize(
            name_,
            symbol_,
            contractOwner_,
            isNonDivisible_
        );
    }
}
