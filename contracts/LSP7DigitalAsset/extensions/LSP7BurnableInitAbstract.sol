// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

/**
 * @title LSP7 token extension that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP7BurnableInitAbstract is LSP7DigitalAssetInitAbstract {
    /**
     * @dev See internal {_burn} function for details.
     */
    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual {
        _burn(from, amount, data);
    }
}
