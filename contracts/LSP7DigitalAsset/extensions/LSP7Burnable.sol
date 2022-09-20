// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAssetCore} from "../LSP7DigitalAssetCore.sol";

/**
 * @dev LSP7 extension that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP7Burnable is LSP7DigitalAssetCore {
    /**
     * @dev Destroys `amount` tokens from the `from` address.
     *
     * See internal _burn function for more details
     */
    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public {
        _burn(from, amount, data);
    }
}
