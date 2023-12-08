// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    ERC725YInitAbstract
} from "@erc725/smart-contracts/contracts/ERC725YInitAbstract.sol";

import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";

import {LSP4DigitalAssetMetadataCore} from "./LSP4DigitalAssetMetadataCore.sol";

// constants
import {
    _LSP4_SUPPORTED_STANDARDS_KEY,
    _LSP4_SUPPORTED_STANDARDS_VALUE,
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_SYMBOL_KEY,
    _LSP4_TOKEN_TYPE_KEY
} from "./LSP4Constants.sol";

/**
 * @title Implementation of a LSP4DigitalAssetMetadata contract that stores the **Token-Metadata** (`LSP4TokenName` and `LSP4TokenSymbol`) in its ERC725Y data store.
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of the LSP4 standard.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is
    LSP4DigitalAssetMetadataCore,
    ERC725YInitAbstract
{
    /**
     * @notice Initializing a digital asset `name_` with the `symbol_` symbol.
     *
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param initialOwner_ The owner of the token contract
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`1` = Token, `2` = NFT, `3` = Collection)
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        uint256 lsp4TokenType_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(initialOwner_);

        // set data key SupportedStandards:LSP4DigitalAsset
        ERC725YCore._setData(
            _LSP4_SUPPORTED_STANDARDS_KEY,
            _LSP4_SUPPORTED_STANDARDS_VALUE
        );

        ERC725YCore._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        ERC725YCore._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
        ERC725YCore._setData(_LSP4_TOKEN_TYPE_KEY, abi.encode(lsp4TokenType_));
    }

    /**
     * @dev The ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed
     * via this function once the digital asset contract has been deployed.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override(ERC725YCore, LSP4DigitalAssetMetadataCore) {
        LSP4DigitalAssetMetadataCore._setData(dataKey, dataValue);
    }
}
