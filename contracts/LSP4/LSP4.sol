// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// constants
import "./LSP4Constants.sol";

// modules
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4 is ERC725Y {
    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) ERC725Y(newOwner_) {
        // TODO: when ERC725Y has been updated
        // bytes32[] keys = new bytes32[](2);
        // bytes[] values = new bytes[](2);
        //
        // keys.push(_LSP4_METADATA_TOKEN_NAME_KEY);
        // values.push(bytes(name_));
        //
        // keys.push(_LSP4_METADATA_TOKEN_SYMBOL_KEY);
        // values.push(bytes(symbol_));
        //
        // setDataFromMemory(keys, values);
        setDataFromMemory(_LSP4_METADATA_TOKEN_NAME_KEY, bytes(name_));
        setDataFromMemory(_LSP4_METADATA_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }
}
