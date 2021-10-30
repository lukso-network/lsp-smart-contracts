// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../LSP7-DigitalAsset/LSP7Init.sol";

contract LSP7InitTester is LSP7Init {
    function initialize(
      string memory name,
      string memory symbol,
      address newOwner
    )
        public
        initializer
        override
    {
        LSP7Init.initialize(name, symbol, newOwner, false);
    }

    function mint(address to, uint256 amount, bool force, bytes memory data) public {
        _mint(to, amount, force, data);
    }

    function burn(address from, uint256 amount, bytes memory data) public {
        _burn(from, amount, data);
    }
}
