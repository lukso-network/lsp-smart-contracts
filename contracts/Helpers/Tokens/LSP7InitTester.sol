// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAssetInit} from "../../LSP7DigitalAsset/LSP7DigitalAssetInit.sol";

contract LSP7InitTester is LSP7DigitalAssetInit {
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public {
        _burn(from, amount, data);
    }
}
