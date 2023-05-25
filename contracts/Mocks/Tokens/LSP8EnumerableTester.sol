// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8Enumerable
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol";

contract LSP8EnumerableTester is LSP8Enumerable {
    constructor(
        string memory name,
        string memory symbol,
        address newOwner,
        uint256 tokenIdType
    ) LSP8IdentifiableDigitalAsset(name, symbol, newOwner, tokenIdType) {}

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
