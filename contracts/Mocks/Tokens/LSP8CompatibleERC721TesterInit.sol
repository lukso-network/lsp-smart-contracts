// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8CompatibleERC721InitAbstract
} from "../../LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibleERC721InitAbstract.sol";

// constants
import {_LSP4_METADATA_KEY} from "../../LSP4DigitalAssetMetadata/LSP4Constants.sol";

contract LSP8CompatibleERC721InitTester is LSP8CompatibleERC721InitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        address newOwner,
        bytes memory tokenURIValue
    ) public virtual initializer {
        LSP8CompatibleERC721InitAbstract._initialize(name, symbol, newOwner);

        _setData(_LSP4_METADATA_KEY, tokenURIValue);
    }

    function mint(
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public {
        // using force=true so we can send to EOA in test
        _mint(to, bytes32(tokenId), true, data);
    }

    function burn(uint256 tokenId, bytes calldata data) public {
        _burn(bytes32(tokenId), data);
    }
}
