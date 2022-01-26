// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// constants
import "./LSP4Constants.sol";
import "./LSP4DigitalAssetMetadataInitAbstract.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Deployable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInit is
    LSP4DigitalAssetMetadataInitAbstract
{
    /**
     * @inheritdoc LSP4DigitalAssetMetadataInitAbstract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override initializer {
        LSP4DigitalAssetMetadataInitAbstract.initialize(
            name_,
            symbol_,
            newOwner_
        );
    }
}
