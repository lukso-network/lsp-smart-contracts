// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {_LSP8_NON_TRANSFERABLE} from "../LSP8Constants.sol";
import {LSP8NonTransferableNotEditable} from "../LSP8Errors.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../LSP8IdentifiableDigitalAssetInitAbstract.sol";

/**
 * @dev LSP8 extension, adds the concept of a non-transferable token.
 */
abstract contract LSP8NonTransferableInitAbstract is
    LSP8IdentifiableDigitalAssetInitAbstract
{
    /**
     * @notice Initializing a `LSP8NonTransferable` token contract with: token name = `name_`, token symbol = `symbol_`,
     * address `newOwner_` as the token contract owner.
     * Switch ON the non-transferable flag.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        // Set the non-transferable flag
        super._setData(_LSP8_NON_TRANSFERABLE, hex"01");

        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_
        );
    }

    /**
     * @dev This function override the internal `_transfer` function to make it non-transferable
     */
    function _transfer(
        address /* from */,
        address /* to */,
        bytes32 /* tokenId */,
        bool /* allowNonLSP1Recipient */,
        bytes memory /* data */
    ) internal virtual override {
        revert("LSP8: Token is non-transferable");
    }

    /**
     * @dev the ERC725Y data key `LSP8NonTransferable` cannot be changed
     * via this function once the digital asset contract has been deployed.
     *
     * @notice This function override the _setData function to make the non-transferable flag not editable
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP8_NON_TRANSFERABLE) {
            revert LSP8NonTransferableNotEditable();
        }
        super._setData(dataKey, dataValue);
    }
}
