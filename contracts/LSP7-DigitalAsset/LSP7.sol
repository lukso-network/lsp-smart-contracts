// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4Constants.sol";

// modules
import "./LSP7Core.sol";
import "../LSP4-DigitalAsset-Metadata/LSP4.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev Implementation of a LSP7 compliant contract.
 */
contract LSP7 is LSP4, LSP7Core {
    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP4(name_, symbol_, newOwner_) {
        _isNFT = isNFT_;
        _registerInterface(_LSP7_INTERFACE_ID);
        _setData(_LSP7_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP7_SUPPORTED_STANDARDS_VALUE));
    }
}
