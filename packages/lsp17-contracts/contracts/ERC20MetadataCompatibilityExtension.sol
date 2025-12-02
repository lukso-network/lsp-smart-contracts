// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// modules
import {
    LSP17Extension
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extension.sol";

// constants
import {
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract ERC20MetadataCompatibilityExtension is LSP17Extension {
    function name() external view returns (string memory) {
        return string(IERC725Y(msg.sender).getData(_LSP4_TOKEN_NAME_KEY));
    }

    function symbol() external view returns (string memory) {
        return string(IERC725Y(msg.sender).getData(_LSP4_TOKEN_SYMBOL_KEY));
    }
}
