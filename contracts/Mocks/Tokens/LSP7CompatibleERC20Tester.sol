// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7CompatibleERC20
} from "../../LSP7DigitalAsset/extensions/LSP7CompatibleERC20.sol";

contract LSP7CompatibleERC20Tester is LSP7CompatibleERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7CompatibleERC20(name_, symbol_, newOwner_) {}

    function mint(address to, uint256 amount, bytes calldata data) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, data);
    }

    function burn(address from, uint256 amount, bytes calldata data) public {
        _burn(from, amount, data);
    }
}
