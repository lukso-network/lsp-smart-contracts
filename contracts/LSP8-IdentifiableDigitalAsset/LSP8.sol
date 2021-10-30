// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP8Constants.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4Constants.sol";

// modules
import "./LSP8Core.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8 is LSP4, LSP8Core {
    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP4(name_, symbol_, newOwner_) {
        _registerInterface(_LSP8_INTERFACE_ID);
        _setData(_LSP8_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP8_SUPPORTED_STANDARDS_VALUE));
    }
}
