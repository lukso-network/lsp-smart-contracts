// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8Burnable
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol";

contract LSP8Tester is LSP8IdentifiableDigitalAsset, LSP8Burnable {
    constructor(
        string memory name,
        string memory symbol,
        address newOwner,
        uint256 tokenIdType
    ) LSP8IdentifiableDigitalAsset(name, symbol, newOwner, tokenIdType) {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}
