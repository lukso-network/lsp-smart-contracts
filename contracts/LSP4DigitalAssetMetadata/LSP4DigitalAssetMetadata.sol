// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// constants
import "./LSP4Constants.sol";

// errors
import {LSP4TokenNameNotEditable, LSP4TokenSymbolNotEditable} from "./LSP4Errors.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadata is ERC725Y {
    /**
     * @notice Sets the name, symbol of the token and the owner, and sets the SupportedStandards:LSP4DigitalAsset key
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the token contract
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) ERC725Y(newOwner_) {
        require(newOwner_ != address(0), "LSP4: new owner cannot be the zero address");

        // set key SupportedStandards:LSP4DigitalAsset
        super._setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);

        super._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        super._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }

    /**
     * @dev the ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed via this function
     *      once the digital asset contract has been deployed
     */
    function _setData(bytes32 key, bytes memory value) internal virtual override {
        if (key == _LSP4_TOKEN_NAME_KEY) {
            revert LSP4TokenNameNotEditable();
        } else if (key == _LSP4_TOKEN_SYMBOL_KEY) {
            revert LSP4TokenSymbolNotEditable();
        } else {
            super._setData(key, value);
        }
    }
}
