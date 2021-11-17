// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LSP8MintableCore.sol";
import "../LSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension.
 */
contract LSP8Mintable is LSP8MintableCore, LSP8IdentifiableDigitalAsset {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override onlyOwner {
        _mint(to, tokenId, force, data);
    }
}
