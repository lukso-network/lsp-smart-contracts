// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP4DigitalAssetMetadata/LSP4Constants.sol";

// modules
import "./LSP7DigitalAssetCore.sol";
import "../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

/**
 * @title LSP7DigitalAsset contract
 * @author Matthew Stevens
 * @dev Implementation of a LSP7 compliant contract.
 */
contract LSP7DigitalAsset is LSP7DigitalAssetCore, LSP4DigitalAssetMetadata {
    /**
     * @notice Sets the token-Metadata and register LSP7InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {
        _isNFT = isNFT_;
        _registerInterface(_INTERFACEID_LSP7);
    }
}
