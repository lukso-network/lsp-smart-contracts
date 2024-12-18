// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8Burnable
} from "@lukso/lsp8-contracts/contracts/extensions/LSP8Burnable.sol";

contract LSP8TransferOwnerChange is LSP8IdentifiableDigitalAsset, LSP8Burnable {
    // solhint-disable-next-line no-empty-blocks
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function _beforeTokenTransfer(
        address,
        address,
        bytes32 tokenId,
        bool,
        bytes memory
    ) internal override {
        // if tokenID exist transfer token ownership to this contract
        if (_exists(tokenId)) {
            _tokenOwners[tokenId] = address(this);
        }
    }
}
