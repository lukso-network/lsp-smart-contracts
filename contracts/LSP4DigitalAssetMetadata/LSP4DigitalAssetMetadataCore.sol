// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// constants
import {_LSP4_TOKEN_NAME_KEY, _LSP4_TOKEN_SYMBOL_KEY} from "./LSP4Constants.sol";

abstract contract LSP4DigitalAssetMetadataCore is ERC725YCore {
    function _setData(bytes32 key, bytes memory value) internal virtual override {
        require(key != _LSP4_TOKEN_NAME_KEY, "LSP4: cannot edit Token Name after deployment");
        require(key != _LSP4_TOKEN_SYMBOL_KEY, "LSP4: cannot edit Token Symbol after deployment");
        super._setData(key, value);
    }
}
