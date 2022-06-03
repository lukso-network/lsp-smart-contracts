// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAssetInitAbstract} from "../../LSP7DigitalAsset/LSP7DigitalAssetInitAbstract.sol";

contract LSP7InitTester is LSP7DigitalAssetInitAbstract {
    function initialize(
        string memory name,
        string memory symbol,
        address newOwner
    ) public initializer {
        LSP7DigitalAssetInitAbstract._initialize(name, symbol, newOwner, false);
    }

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
