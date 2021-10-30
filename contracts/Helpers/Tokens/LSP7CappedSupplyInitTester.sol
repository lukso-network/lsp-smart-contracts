// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP7-DigitalAsset/extensions/LSP7CappedSupplyInit.sol";

contract LSP7CappedSupplyInitTester is LSP7CappedSupplyInit {
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
        LSP7Init.initialize(name, symbol, newOwner, true);
        LSP7CappedSupplyInit.initialize(tokenSupplyCap);
    }

    function mint(address to, uint256 amount) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, "token printer go brrr");
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount, "feel the burn");
    }
}
