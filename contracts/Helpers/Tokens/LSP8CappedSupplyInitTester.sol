// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {LSP8CappedSupplyInitAbstract} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInitAbstract.sol";

contract LSP8CappedSupplyInitTester is LSP8CappedSupplyInitAbstract {
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner,
        uint256 tokenSupplyCap
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name, symbol, newOwner);
        LSP8CappedSupplyInitAbstract._initialize(tokenSupplyCap);
    }

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
