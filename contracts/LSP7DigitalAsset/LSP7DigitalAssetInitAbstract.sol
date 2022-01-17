// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP4DigitalAssetMetadata/LSP4Constants.sol";

// modules
import "./LSP7DigitalAssetCore.sol";
import "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadataInitAbstract.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Proxy Implementation of a LSP7 compliant contract.
 */
abstract contract LSP7DigitalAssetInitAbstract is
    Initializable,
    LSP4DigitalAssetMetadataInitAbstract,
    LSP7DigitalAssetCore
{
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
    ) public virtual onlyInitializing {
        _isNFT = isNFT_;
        LSP4DigitalAssetMetadataInitAbstract.initialize(
            name_,
            symbol_,
            newOwner_
        );

        _registerInterface(_INTERFACEID_LSP7);
    }
}
