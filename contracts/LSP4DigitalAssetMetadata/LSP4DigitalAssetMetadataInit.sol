// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {LSP4DigitalAssetMetadataInitAbstract} from "./LSP4DigitalAssetMetadataInitAbstract.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Deployable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInit is LSP4DigitalAssetMetadataInitAbstract {
    /**
     * @notice Sets the name, symbol of the token and the owner, and sets the SupportedStandards:LSP4DigitalAsset key
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token contract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual initializer {
        LSP4DigitalAssetMetadataInitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
