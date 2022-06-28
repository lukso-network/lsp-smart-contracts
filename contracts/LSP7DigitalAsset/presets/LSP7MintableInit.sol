// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7MintableInitAbstract} from "./LSP7MintableInitAbstract.sol";

/**
 * @dev LSP7 extension, mintable.
 */
contract LSP7MintableInit is LSP7MintableInitAbstract {
    /**
     * @dev initialize (= lock) base contract on deployment
     */
    constructor() initializer {}

    /**
     * @notice Sets the token-Metadata and register LSP7InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) public virtual initializer {
        LSP7MintableInitAbstract._initialize(name_, symbol_, newOwner_, isNFT_);
    }
}
