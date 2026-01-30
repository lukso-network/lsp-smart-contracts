// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAssetInitAbstract} from "../LSP7DigitalAssetInitAbstract.sol";
import {LSP7NonTransferableInitAbstract} from "../extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol";

contract LSP7NonTransferableInit is LSP7NonTransferableInitAbstract {
    /// @dev initialize (= lock) base implementation contract on deployment
    constructor() {
        _disableInitializers();
    }

    /// @notice Deploying a `LSP7NonTransferableInit` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) external virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __LSP7NonTransferable_init_unchained(
            transferable_,
            transferLockStart_,
            transferLockEnd_
        );
        __LSP7Allowlist_init_unchained(newOwner_);
    }
}
