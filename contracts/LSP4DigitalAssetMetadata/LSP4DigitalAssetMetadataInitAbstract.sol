// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// modules
import {ERC725YInitAbstract} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// constants
import "./LSP4Constants.sol";

// errors
import {LSP4TokenNameNotEditable, LSP4TokenSymbolNotEditable} from "./LSP4Errors.sol";

/**
 * @title LSP4DigitalAssetMetadata
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of a LSP8 compliant contract.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is ERC725YInitAbstract {
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(newOwner_);

        // set SupportedStandards:LSP4DigitalAsset
        super._setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);

        super._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        super._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }

    /**
     * @dev the ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed
     *      via this function once the digital asset contract has been deployed.
     *
     * @dev SAVE GAS by emitting the DataChanged event with only the first 256 bytes of dataValue
     */
    function _setData(bytes32 dataKey, bytes memory dataValue) internal virtual override {
        if (dataKey == _LSP4_TOKEN_NAME_KEY) {
            revert LSP4TokenNameNotEditable();
        } else if (dataKey == _LSP4_TOKEN_SYMBOL_KEY) {
            revert LSP4TokenSymbolNotEditable();
        } else {
            _store[dataKey] = dataValue;
            emit DataChanged(
                dataKey,
                dataValue.length <= 256 ? dataValue : BytesLib.slice(dataValue, 0, 256)
            );
        }
    }
}
