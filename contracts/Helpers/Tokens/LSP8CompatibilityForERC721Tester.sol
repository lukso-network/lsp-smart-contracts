// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol";
import "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract LSP8CompatibilityForERC721Tester is LSP8CompatibilityForERC721 {
    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name,
        string memory symbol,
        address newOwner,
        string memory tokenURIValue
    ) LSP8CompatibilityForERC721(name, symbol, newOwner) {
        _setData(_LSP4_METADATA_TOKEN_NAME_KEY, bytes(name));
        _setData(_LSP4_METADATA_TOKEN_SYMBOL_KEY, bytes(symbol));
        _setData(_LSP4_METADATA_KEY, bytes(tokenURIValue));
    }

    function mint(
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public {
        // using force=true so we can send to EOA in test
        _mint(to, bytes32(tokenId), true, data);
    }
}
