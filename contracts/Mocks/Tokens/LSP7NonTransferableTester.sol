// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP7NonTransferable
} from "../../LSP7DigitalAsset/extensions/LSP7NonTransferable.sol";

contract LSP7NonTransferableTester is LSP7NonTransferable {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNonDivisible_
    ) LSP7NonTransferable(name_, symbol_, newOwner_, isNonDivisible_) {}

    function mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        _mint(to, amount, allowNonLSP1Recipient, data);
    }
}
