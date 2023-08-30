// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// modules
import {
    LSP7NonTransferableInitAbstract
} from "../../LSP7DigitalAsset/extensions/LSP7NonTransferableInitAbstract.sol";

contract LSP7NonTransferableInitTester is LSP7NonTransferableInitAbstract {
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNonDivisible_
    ) public virtual initializer {
        LSP7NonTransferableInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            isNonDivisible_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool allowNonLSP1Recipient,
        bytes memory data
    ) public virtual {
        _mint(to, amount, allowNonLSP1Recipient, data);
    }
}
