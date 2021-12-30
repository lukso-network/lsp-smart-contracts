// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../LSP7DigitalAsset.sol";

// interfaces
import "./ILSP7CompatibilityForERC20.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
contract LSP7CompatibilityForERC20 is
    ILSP7CompatibilityForERC20,
    LSP7DigitalAsset
{
    /* solhint-disable no-empty-blocks */
    /**
     * @notice Sets the name, the symbol and the owner of the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, false) {}

    /**
     * @inheritdoc ILSP7CompatibilityForERC20
     */
    function approve(address operator, uint256 amount)
        external
        virtual
        override
    {
        return authorizeOperator(operator, amount);
    }

    /**
     * @inheritdoc ILSP7CompatibilityForERC20
     */
    function allowance(address tokenOwner, address operator)
        external
        view
        virtual
        override
        returns (uint256)
    {
        return isOperatorFor(operator, tokenOwner);
    }

    /**
     * @inheritdoc ILSP7CompatibilityForERC20
     * @dev Compatible with ERC20 transfer.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transfer(address to, uint256 amount) external virtual override {
        return transfer(_msgSender(), to, amount, true, "compat-transfer");
    }

    /**
     * @inheritdoc ILSP7CompatibilityForERC20
     * @dev Compatible with ERC20 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external virtual override {
        return transfer(from, to, amount, true, "compat-transferFrom");
    }
}
