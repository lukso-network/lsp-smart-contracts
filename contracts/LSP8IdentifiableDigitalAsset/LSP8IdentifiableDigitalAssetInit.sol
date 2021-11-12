// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP8IdentifiableDigitalAssetCore.sol";
import "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadataInit.sol";

// constants
import "./LSP8Constants.sol";
import "../LSP4DigitalAssetMetadata/LSP4Constants.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8IdentifiableDigitalAssetInit is Initializable, LSP4DigitalAssetMetadataInit, LSP8IdentifiableDigitalAssetCore {

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
        LSP4DigitalAssetMetadataInit.initialize(name_, symbol_, newOwner_);

        _registerInterface(_LSP8_INTERFACE_ID);
        _setData(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
    }
}
