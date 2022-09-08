// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8EnumerableInitAbstract} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8EnumerableInitAbstract.sol";

contract LSP8EnumerableInitTester is LSP8EnumerableInitAbstract {
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name, symbol, newOwner);
    }

    function mint(address to, bytes32 tokenId) external {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) external {
        _burn(tokenId, "feel the burn");
    }
}
