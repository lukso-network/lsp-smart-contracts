// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7CappedSupplyInitAbstract} from "./LSP7CappedSupplyInitAbstract.sol";

/**
 * @dev LSP7 extension, adds token supply cap.
 */
abstract contract LSP7CappedSupplyInit is LSP7CappedSupplyInitAbstract {
    /**
     * @notice Sets the token max supply
     * @param tokenSupplyCap_ The Token max supply
     */
    function initialize(uint256 tokenSupplyCap_) public virtual initializer {
        LSP7CappedSupplyInitAbstract._initialize(tokenSupplyCap_);
    }
}
