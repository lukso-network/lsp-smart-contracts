// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

/**
 * @dev LSP7DigitalAsset deployable preset contract (inheritable proxy version) with a public {mint} function callable only by the contract {owner}.
 */
abstract contract LSP7MintableInitAbstract is
    LSP7DigitalAssetInitAbstract,
    ILSP7Mintable
{
    /**
     * @notice Initialize a `LSP7MintableInitAbstract` token contract with: token name = `name_`, token symbol = `symbol_`, and
     * address `newOwner_` as the token contract owner.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
    }

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
