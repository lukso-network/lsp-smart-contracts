// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// interfaces
import {ILSP7Mintable} from "./ILSP7Mintable.sol";

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

/**
 * @dev LSP7 extension, mintable.
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
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNonDivisible_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            isNonDivisible_
        );
    }

    /**
     * @dev Public {_mint} function only callable by the {owner}.
     */
    function mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, amount, allowNonLSP1Recipient, data);
    }
}
