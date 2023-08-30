// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8NonTransferable
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferable.sol";

contract LSP8NonTransferableTester is LSP8NonTransferable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8NonTransferable(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        _mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
