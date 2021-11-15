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
 * @dev Implementation of a LSP7 compliant contract.
 */
contract LSP7DigitalAsset is LSP4DigitalAssetMetadata, LSP7DigitalAssetCore {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP4DigitalAssetMetadata(name_, symbol_, newOwner_) {
        _isNFT = isNFT_;
        _registerInterface(_LSP7_INTERFACE_ID);
        _setData(_LSP7_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP7_SUPPORTED_STANDARDS_VALUE));
    }
}
