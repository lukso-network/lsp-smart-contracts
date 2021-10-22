// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP4/LSP4Constants.sol";

// modules
import "./LSP7Core.sol";
import "../LSP4/LSP4Init.sol";

/**
 * @dev Implementation of a LSP7 compliant contract.
 */
contract LSP7Init is Initializable, LSP4Init, LSP7Core {
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
        override
        initializer
    {
        LSP4Init.initialize(name_, symbol_, newOwner_);

        _setData(_LSP7_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP7_SUPPORTED_STANDARDS_VALUE));
    }
}
