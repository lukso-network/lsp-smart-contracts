// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8NonTransferableInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8NonTransferableInitAbstract.sol";

contract LSP8NonTransferableInitTester is LSP8NonTransferableInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual initializer {
        LSP8NonTransferableInitAbstract._initialize(name_, symbol_, newOwner_);
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        _mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
