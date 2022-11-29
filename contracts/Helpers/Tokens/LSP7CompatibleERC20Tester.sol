// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {LSP7CompatibleERC20} from "../../LSP7DigitalAsset/extensions/LSP7CompatibleERC20.sol";
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset/LSP7DigitalAsset.sol";

contract LSP7CompatibleERC20Tester is LSP7CompatibleERC20 {
    /* solhint-disable no-empty-blocks */
    constructor(
        string memory name,
        string memory symbol,
        address newOwner
    ) LSP7CompatibleERC20(name, symbol, newOwner) {}

    function mint(
        address to,
        uint256 amount,
        bytes calldata data
    ) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, data);
    }

    function burn(
        address from,
        uint256 amount,
        bytes calldata data
    ) public {
        _burn(from, amount, data);
    }
}
