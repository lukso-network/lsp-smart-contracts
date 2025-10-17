// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {
    LSP0ERC725Account
} from "@lukso/lsp0-contracts/contracts/LSP0ERC725Account.sol";

contract MockLSP0ERC725Account is LSP0ERC725Account {
    constructor(address initialOwner) payable LSP0ERC725Account(initialOwner) {}
}
