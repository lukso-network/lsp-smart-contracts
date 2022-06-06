// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "./LSP8IdentifiableDigitalAssetInitAbstract.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Proxy Implementation of a LSP8 compliant contract.
 */
contract LSP8IdentifiableDigitalAssetInit is LSP8IdentifiableDigitalAssetInitAbstract {
    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
