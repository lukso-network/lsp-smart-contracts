// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8CappedSupplyInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInitAbstract.sol";

contract LSP8CappedSupplyInitTester is LSP8CappedSupplyInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 tokenIdType_,
        uint256 tokenSupplyCap_
    ) public virtual initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            tokenIdType_
        );
        LSP8CappedSupplyInitAbstract._initialize(tokenSupplyCap_);
    }

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
