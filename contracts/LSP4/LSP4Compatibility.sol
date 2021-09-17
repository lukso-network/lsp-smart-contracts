// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import "./ILSP4Compatibility.sol";

// modules
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";

/**
 * @dev LSP4 extension, for compatibility with clients & tools that expect ERC20/721.
 */
abstract contract LSP4Compatibility is ERC725Y, ILSP4Compatibility {
    //
    // --- Constants
    //

    // keccak256('LSP4TokenName')
    bytes32 constant _LSP4_METADATA_TOKEN_NAME_KEY = 0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1;

    // keccak256('LSP4TokenSymbol')
    bytes32 constant _LSP4_METADATA_TOKEN_SYMBOL_KEY = 0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756;

    //
    // --- Token queries
    //

    /**
     * @dev Returns the name of the token.
     */
    function name()
        public
        virtual
        override
        view
        returns(string memory)
    {
        // TODO: when ERC725Y has been updated
        // bytes memory data = _getData(_LSP4_METADATA_TOKEN_NAME_KEY);
        bytes memory data = getData(_LSP4_METADATA_TOKEN_NAME_KEY);
        return string(data);
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the name.
     */
    function symbol()
        public
        virtual
        override
        view
        returns(string memory)
    {
        // TODO: when ERC725Y has been updated
        // bytes memory data = _getData(_LSP4_METADATA_TOKEN_SYMBOL_KEY);
        bytes memory data = getData(_LSP4_METADATA_TOKEN_SYMBOL_KEY);
        return string(data);
    }
}
