// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../LSP8-IdentifiableDigitalAsset/LSP8Init.sol";

contract LSP8InitTester is LSP8Init {
    function initialize(
      string memory name,
      string memory symbol,
      address newOwner
    )
        public
        initializer
        override
    {
        LSP8Init.initialize(name, symbol, newOwner);
    }

    function mint(address to, bytes32 tokenId, bool force, bytes memory data) public {
        _mint(to, tokenId, force, data);
    }

    function burn(bytes32 tokenId, bytes memory data) public {
        _burn(tokenId, data);
    }
}
