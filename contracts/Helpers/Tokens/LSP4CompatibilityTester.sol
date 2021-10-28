// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../LSP4-DigitalAsset-Metadata/LSP4Compatibility.sol";

contract LSP4CompatibilityTester is LSP4Compatibility {
    constructor(
      string memory name,
      string memory symbol,
      address newOwner
    ) ERC725Y(newOwner) {
        _setData(_LSP4_METADATA_TOKEN_NAME_KEY, bytes(name));
        _setData(_LSP4_METADATA_TOKEN_SYMBOL_KEY, bytes(symbol));
    }
}
