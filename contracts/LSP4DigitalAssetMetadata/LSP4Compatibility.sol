// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725YCore.sol";

// interfaces
import "./ILSP4Compatibility.sol";

// libraries
import "../Utils/ERC725Utils.sol";

// constants
import "./LSP4Constants.sol";

/**
 * @title LSP4Compatibility
 * @author Matthew Stevens
 * @dev LSP4 extension, for compatibility with clients & tools that expect ERC20/721.
 */
abstract contract LSP4Compatibility is ILSP4Compatibility, ERC725YCore {
    // --- Token queries

    /**
     * @dev Returns the name of the token.
     * @return The name of the token
     */
    function name() public view virtual override returns (string memory) {
        bytes memory data = ERC725Utils.getDataSingle(
            this,
            _LSP4_TOKEN_NAME_KEY
        );
        return string(data);
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the name.
     * @return The symbol of the token
     */
    function symbol() public view virtual override returns (string memory) {
        bytes memory data = ERC725Utils.getDataSingle(
            this,
            _LSP4_TOKEN_SYMBOL_KEY
        );
        return string(data);
    }
}
