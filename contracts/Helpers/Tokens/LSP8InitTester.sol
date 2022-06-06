// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP8IdentifiableDigitalAssetInitAbstract} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";

contract LSP8InitTester is LSP8IdentifiableDigitalAssetInitAbstract {
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner
    ) public initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(name, symbol, newOwner);
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function burn(bytes32 tokenId, bytes memory data) public {
        _burn(tokenId, data);
    }
}
