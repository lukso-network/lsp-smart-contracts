// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "./ILSP7CompatibilityForERC20.sol";

// modules
import "../LSP7.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
abstract contract LSP7CompatibilityForERC20 is ILSP7CompatibilityForERC20, LSP7Core {
    /*
     * @dev Compatible with ERC20 approve.
     */
    function approve(address operator, uint256 amount)
        external
        virtual
        override
    {
        return authorizeOperator(operator, amount);
    }

    /*
     * @dev Compatible with ERC20 allowance.
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

    /*
     * @dev Compatible with ERC20 transfer.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transfer(address to, uint256 amount)
        external
        virtual
        override
    {
        return transfer(_msgSender(), to, amount, true, "compat-transfer");
    }

    /*
     * @dev Compatible with ERC20 transferFrom.
     * Using force=true so that EOA and any contract may receive the tokens.
     */
    function transferFrom(address from, address to, uint256 amount)
        external
        virtual
        override
    {
        return transfer(from, to, amount, true, "compat-transferFrom");
    }
}
