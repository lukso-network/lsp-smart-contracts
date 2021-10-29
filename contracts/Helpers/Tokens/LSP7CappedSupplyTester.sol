// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import "../../LSP7-DigitalAsset/extensions/LSP7CappedSupply.sol";

contract LSP7CappedSupplyTester is LSP7CappedSupply {
    /* solhint-disable no-empty-blocks */
    constructor(
      string memory name,
      string memory symbol,
      address newOwner,
      uint256 tokenSupplyCap
    ) LSP7(name, symbol, newOwner, true) LSP7CappedSupply(tokenSupplyCap) {}

    function mint(address to, uint256 amount) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, "token printer go brrr");
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount, "feel the burn");
    }
}
