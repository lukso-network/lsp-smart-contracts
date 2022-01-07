// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721Init.sol";
import "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract LSP8CompatibilityForERC721InitTester is LSP8CompatibilityForERC721Init {
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner,
        bytes memory tokenURIValue
    ) public virtual initializer {
        LSP8CompatibilityForERC721Init.initialize(name, symbol, newOwner);

        _setData(_LSP4_METADATA_KEY, tokenURIValue);
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
