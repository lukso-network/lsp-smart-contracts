// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset/LSP7DigitalAsset.sol";
import {
    LSP7CappedSupply
} from "../../LSP7DigitalAsset/extensions/LSP7CappedSupply.sol";

contract LSP7CappedSupplyTester is LSP7CappedSupply {
    constructor(
        string memory name,
        string memory symbol,
        address newOwner,
        uint256 tokenSupplyCap
    )
        LSP7DigitalAsset(name, symbol, newOwner, true)
        LSP7CappedSupply(tokenSupplyCap)
    {}

    function mint(address to, uint256 amount) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, "token printer go brrr");
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount, "feel the burn");
    }
}
