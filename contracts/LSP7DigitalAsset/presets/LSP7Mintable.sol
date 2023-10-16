// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";

/**
 * @title LSP7DigitalAsset deployable preset contract with a public {mint} function callable only by the contract {owner}.
 * @author Jean Cavallera, Yamen Merhi
 */
contract LSP7Mintable is LSP7DigitalAsset, ILSP7Mintable {
    /**
     * @notice Deploying a `LSP7Mintable` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `contractOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param contractOwner_ The address that can mint new tokens and set metadata via {`setData`} and {`setDataBatch`} on the token contract and transfer or renounce ownership of the token contract..
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address contractOwner_,
        bool isNonDivisible_
    ) LSP7DigitalAsset(name_, symbol_, contractOwner_, isNonDivisible_) {}

    /**
     * @dev Public {_mint} function only callable by the {owner}.
     */
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override onlyOwner {
        _mint(to, amount, force, data);
    }
}
