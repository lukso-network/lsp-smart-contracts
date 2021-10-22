// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// constants
import "./LSP4Constants.sol";

// modules
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725YInit.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4Init is Initializable, ERC725YInit {
    //
    // --- Initialize
    //

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) 
        public
        virtual
        initializer
    {
        ERC725YInit.initialize(newOwner_);
        
        _setData(_LSP4_METADATA_TOKEN_NAME_KEY, bytes(name_));
        _setData(_LSP4_METADATA_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }
}
