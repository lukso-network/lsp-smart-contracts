// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP7DigitalAsset} from "../../LSP7DigitalAsset/LSP7DigitalAsset.sol";

contract LSP7MintWhenDeployed is LSP7DigitalAsset {
    constructor(
        string memory name,
        string memory symbol,
        address newOwner
    ) LSP7DigitalAsset(name, symbol, newOwner, false) {
        _mint(newOwner, 1_000, true, "");
    }
}
