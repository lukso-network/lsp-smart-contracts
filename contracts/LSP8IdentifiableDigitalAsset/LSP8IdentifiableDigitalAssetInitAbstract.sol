// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP8IdentifiableDigitalAssetCore.sol";
import "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadataInitAbstract.sol";

// constants
import "./LSP8Constants.sol";
import "../LSP4DigitalAssetMetadata/LSP4Constants.sol";

/**
 * @title LSP8IdentifiableDigitalAsset contract
 * @author Matthew Stevens
 * @dev Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP8IdentifiableDigitalAssetInitAbstract is
    Initializable,
    LSP4DigitalAssetMetadataInitAbstract,
    LSP8IdentifiableDigitalAssetCore
{
    /**
     * @notice Sets the token-Metadata and register LSP8InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual override onlyInitializing {
        LSP4DigitalAssetMetadataInitAbstract.initialize(
            name_,
            symbol_,
            newOwner_
        );

        _registerInterface(_INTERFACEID_LSP8);
    }
}
