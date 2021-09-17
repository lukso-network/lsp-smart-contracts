// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import "./LSP8Core.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev Implementation of a LSP8 compliant contract.
 */
contract LSP8 is ERC725Y, LSP8Core {
    //
    // --- Initialize
    //

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC725Y(msg.sender) {
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
        setDataFromMemory(_LSP4_METADATA_TOKEN_NAME_KEY, abi.encode(name_));
        setDataFromMemory(_LSP4_METADATA_TOKEN_SYMBOL_KEY, abi.encode(symbol_));
    }

    //
    // --- Overrides
    //

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, LSP8Core)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setData(bytes32 _key, bytes calldata _value)
        public
        virtual
        override(ERC725YCore, ERC725Y)
     {
        super.setData(_key, _value);
    }

    function setDataFromMemory(bytes32 _key, bytes memory _value)
        public
        virtual
        override(ERC725YCore, ERC725Y)
     {
        super.setDataFromMemory(_key, _value);
    }
}
