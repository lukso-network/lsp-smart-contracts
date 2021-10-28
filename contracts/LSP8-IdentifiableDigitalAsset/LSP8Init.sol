// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP8Constants.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4Constants.sol";

// modules
import "./LSP8Core.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4Init.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8Init is Initializable, LSP4Init, LSP8Core {
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

        _registerInterface(_LSP8_INTERFACE_ID);
        _setData(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
    }
}
