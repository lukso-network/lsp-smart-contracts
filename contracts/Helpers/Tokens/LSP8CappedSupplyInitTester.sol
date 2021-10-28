// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP8-IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInit.sol";

contract LSP8CappedSupplyInitTester is LSP8CappedSupplyInit {
    function initialize(
      string memory name,
      string memory symbol,
      address newOwner,
      uint256 tokenSupplyCap
    )
        public
        virtual
        initializer
    {
        LSP8Init.initialize(name, symbol, newOwner);
        LSP8CappedSupplyInit.initialize(tokenSupplyCap);
    }

    function mint(address to, bytes32 tokenId) public {
        _mint(to, tokenId, true, "token printer go brrr");
    }

    function burn(bytes32 tokenId) public {
        _burn(tokenId, "feel the burn");
    }
}
