// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP8IdentifiableDigitalAssetInitAbstract.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Proxy Implementation of a LSP8 compliant contract.
 */
contract LSP8IdentifiableDigitalAssetInit is
    LSP8IdentifiableDigitalAssetInitAbstract
{
    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetInitAbstract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override initializer {
        LSP8IdentifiableDigitalAssetInitAbstract.initialize(
            name_,
            symbol_,
            newOwner_
        );
    }
}
