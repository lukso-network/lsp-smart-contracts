// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {
    LSP8Reference
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8Reference.sol";

import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract LSP8ReferenceContractCollectionTester is
    LSP8IdentifiableDigitalAsset,
    LSP8Reference
{
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_) {}

    function mintAndCheckFromModifier(
        address to,
        bytes32 tokenId
    ) public onlyReferencedContract(tokenId) {
        _mint(to, tokenId, true, "Minting and tokenId - Address");
    }

    function mintAndCheckInternally(address to, bytes32 tokenId) public {
        require(
            verifyReference(address(uint160(uint256(tokenId)))),
            "Invalid reference address"
        );
        _mint(to, tokenId, true, "Minting and tokenId - Address");
    }
}
