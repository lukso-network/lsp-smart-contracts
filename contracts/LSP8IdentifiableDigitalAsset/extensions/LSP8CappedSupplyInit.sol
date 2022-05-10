// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8CappedSupplyInitAbstract} from "./LSP8CappedSupplyInitAbstract.sol";

/**
 * @dev LSP8 extension, adds token supply cap.
 */
abstract contract LSP8CappedSupplyInit is LSP8CappedSupplyInitAbstract {
    /**
     * @notice Sets the token max supply
     * @param tokenSupplyCap_ The Token max supply
     */
    function initialize(uint256 tokenSupplyCap_) public virtual initializer {
        LSP8CappedSupplyInitAbstract._initialize(tokenSupplyCap_);
    }
}
