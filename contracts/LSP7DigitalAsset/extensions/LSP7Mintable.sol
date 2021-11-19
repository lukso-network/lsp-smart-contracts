// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LSP7MintableCore.sol";
import "../LSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, mintable.
 */
contract LSP7Mintable is LSP7MintableCore, LSP7DigitalAsset {
    // solhint-disable no-empty-blocks
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, isNFT_) {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override onlyOwner {
        _mint(to, amount, force, data);
    }
}
