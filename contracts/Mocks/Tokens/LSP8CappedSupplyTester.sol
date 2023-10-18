// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8CappedSupply
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol";

contract LSP8CappedSupplyTester is LSP8CappedSupply {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_,
        uint256 tokenSupplyCap_
    )
        LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_)
        LSP8CappedSupply(tokenSupplyCap_)
    {}

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
