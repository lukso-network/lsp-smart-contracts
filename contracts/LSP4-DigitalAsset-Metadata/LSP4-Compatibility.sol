// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725/ERC725Y.sol";

// interfaces
import "./ILSP4-Compatibility.sol";

// libraries
import "@erc725/smart-contracts/contracts/Utils/ERC725Utils.sol";

// constants
import "./LSP4-Constants.sol";

/**
 * @dev LSP4 extension, for compatibility with clients & tools that expect ERC20/721.
 */
abstract contract LSP4Compatibility is ERC725Y, ILSP4Compatibility {
    
    // --- Token queries

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
        bytes memory data = ERC725Utils.getDataSingle(this, _LSP4_METADATA_TOKEN_NAME_KEY);
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
        bytes memory data = ERC725Utils.getDataSingle(this, _LSP4_METADATA_TOKEN_SYMBOL_KEY);
        return string(data);
    }
}
