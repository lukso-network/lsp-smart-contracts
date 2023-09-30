// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    ERC725YInitAbstract
} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

// constants
import {
    _LSP4_SUPPORTED_STANDARDS_KEY,
    _LSP4_SUPPORTED_STANDARDS_VALUE,
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY
} from "./LSP4Constants.sol";

// errors
import {
    LSP4TokenNameNotEditable,
    LSP4TokenSymbolNotEditable
} from "./LSP4Errors.sol";

/**
 * @title Implementation of a LSP4DigitalAssetMetadata contract that stores the **Token-Metadata** (`LSP4TokenName` and `LSP4TokenSymbol`) in its ERC725Y data store.
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of the LSP4 standard.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is ERC725YInitAbstract {
    /**
     * @notice Initializing a digital asset `name_` with the `symbol_` symbol.
     *
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param initialOwner_ The owner of the token contract
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address initialOwner_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(initialOwner_);

        // set data key SupportedStandards:LSP4DigitalAsset
        super._setData(
            _LSP4_SUPPORTED_STANDARDS_KEY,
            _LSP4_SUPPORTED_STANDARDS_VALUE
        );

        super._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        super._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
    }

    /**
     * @dev the ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed
     * via this function once the digital asset contract has been deployed.
     *
     * @dev Save gas by emitting the {DataChanged} event with only the first 256 bytes of dataValue
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP4_TOKEN_NAME_KEY) {
            revert LSP4TokenNameNotEditable();
        } else if (dataKey == _LSP4_TOKEN_SYMBOL_KEY) {
            revert LSP4TokenSymbolNotEditable();
        } else {
            _store[dataKey] = dataValue;
            emit DataChanged(
                dataKey,
                dataValue.length <= 256
                    ? dataValue
                    : BytesLib.slice(dataValue, 0, 256)
            );
        }
    }
}
