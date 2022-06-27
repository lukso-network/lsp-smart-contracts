// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset/LSP7DigitalAsset.sol";
import {LSP7CompatibilityForERC20Init} from "../../LSP7DigitalAsset/extensions/LSP7CompatibilityForERC20Init.sol";

contract LSP7CompatibilityForERC20InitTester is LSP7CompatibilityForERC20Init {
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
