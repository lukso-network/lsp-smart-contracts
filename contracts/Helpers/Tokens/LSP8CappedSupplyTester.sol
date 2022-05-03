// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAsset} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {LSP8CappedSupply} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol";

contract LSP8CappedSupplyTester is LSP8CappedSupply {
    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name,
        string memory symbol,
        address newOwner,
        uint256 tokenSupplyCap
    ) LSP8IdentifiableDigitalAsset(name, symbol, newOwner) LSP8CappedSupply(tokenSupplyCap) {}

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
