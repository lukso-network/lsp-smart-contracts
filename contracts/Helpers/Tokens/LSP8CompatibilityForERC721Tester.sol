// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP8-IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol";
import "../../LSP8-IdentifiableDigitalAsset/LSP8.sol";

contract LSP8CompatibilityForERC721Tester is LSP8, LSP8CompatibilityForERC721 {
    /* solhint-disable no-empty-blocks */
    constructor(
      string memory name,
      string memory symbol,
      address newOwner
    ) LSP8(name, symbol, newOwner) {}

    function mint(address to, uint256 tokenId, bytes calldata data) public {
        // using force=true so we can send to EOA in test
        _mint(to, bytes32(tokenId), true, data);
    }
}
