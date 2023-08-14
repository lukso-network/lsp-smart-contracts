// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    LSP8BurnableInitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8BurnableInitAbstract.sol";

contract LSP8InitTester is
    LSP8IdentifiableDigitalAssetInitAbstract,
    LSP8BurnableInitAbstract
{
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner
    ) public initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name,
            symbol,
            newOwner
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public {
        _mint(to, tokenId, allowNonLSP1Recipient, data);
    }
}
