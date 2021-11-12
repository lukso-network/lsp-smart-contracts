// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP8-IdentifiableDigitalAssetCore.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4-DigitalAsset-Metadata.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// constants
import "./LSP8-Constants.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4-Constants.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8 is LSP4, LSP8Core {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP4(name_, symbol_, newOwner_) {
        _registerInterface(_LSP8_INTERFACE_ID);
        _setData(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
    }
}
