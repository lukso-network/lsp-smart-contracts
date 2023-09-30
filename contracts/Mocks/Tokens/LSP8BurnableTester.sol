// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8Burnable
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol";

contract LSP8BurnableTester is LSP8Burnable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_, tokenIdType_) {}
}
