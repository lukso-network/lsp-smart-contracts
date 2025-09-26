// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {
    LSP7NonTransferable as LSP7NonTransferableAbstract
} from "../extensions/LSP7NonTransferable/LSP7NonTransferable.sol";
import {
    LSP7Allowlist as LSP7AllowlistAbstract
} from "../extensions/LSP7Allowlist/LSP7Allowlist.sol";

contract LSP7NonTransferable is LSP7NonTransferableAbstract {
    /// @notice Deploying a `LSP7NonTransferable` token contract.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is a fungible or non-fungible token.
    /// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7NonTransferableAbstract(
            transferable_,
            transferLockStart_,
            transferLockEnd_
        )
        LSP7AllowlistAbstract(newOwner_)
    {}
}
