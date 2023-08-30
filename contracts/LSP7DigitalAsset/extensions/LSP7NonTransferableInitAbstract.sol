// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {_LSP7_NON_TRANSFERABLE} from "../LSP7Constants.sol";
import {LSP7NonTransferableNotEditable} from "../LSP7Errors.sol";
import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";

/**
 * @dev LSP7 extension, adds the concept of a non-transferable token.
 */
abstract contract LSP7NonTransferableInitAbstract is
    LSP7DigitalAssetInitAbstract
{
    /**
     * @notice Initializing a `LSP7NonTransferable` token contract with: token name = `name_`, token symbol = `symbol_`,
     * address `newOwner_` as the token contract owner, and _isNonDivisible_ = `isNonDivisible_`.
     * Switch ON the non-transferable flag.
     *
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param isNonDivisible_ Specify if the tokens from this contract can be divided in smaller units or not.
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNonDivisible_
    ) internal virtual override onlyInitializing {
        // Set the non-transferable flag
        super._setData(_LSP7_NON_TRANSFERABLE, hex"01");

        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            isNonDivisible_
        );
    }

    /**
     * @dev This function override the internal `_transfer` function to make it non-transferable
     */
    function _transfer(
        address /* from */,
        address /* to */,
        uint256 /* amount */,
        bool /* allowNonLSP1Recipient */,
        bytes memory /* data */
    ) internal virtual override {
        revert("LSP7: Token is non-transferable");
    }

    /**
     * @dev the ERC725Y data key `LSP7NonTransferable` cannot be changed
     * via this function once the digital asset contract has been deployed.
     *
     * @notice This function override the _setData function to make the non-transferable flag not editable
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP7_NON_TRANSFERABLE) {
            revert LSP7NonTransferableNotEditable();
        }
        super._setData(dataKey, dataValue);
    }
}
