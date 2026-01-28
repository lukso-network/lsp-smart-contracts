// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7AllowlistAbstract} from "../LSP7Allowlist/LSP7AllowlistAbstract.sol";

// interfaces
import {ILSP7NonTransferable} from "./ILSP7NonTransferable.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {
    LSP7TransferDisabled,
    LSP7InvalidTransferLockPeriod,
    LSP7CannotUpdateTransferLockPeriod
} from "./LSP7NonTransferableErrors.sol";

/// @title LSP7NonTransferableAbstract
/// @dev Abstract contract implementing non-transferable LSP7 token functionality with transfer lock periods and allowlist support.
abstract contract LSP7NonTransferableAbstract is
    ILSP7NonTransferable,
    LSP7AllowlistAbstract
{
    // solhint-disable not-rely-on-time
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Indicates whether the token is currently transferable.
    bool public transferable;

    /// @notice The timestamp at which point in time the token is not transferrable.
    /// @dev `transferLockStart` can be disabled by setting it to 0. It means no start time is set (transfers locked up until `transferLockEnd`).
    uint256 public transferLockStart;

    /// @notice The timestamp at which point in time the non-transferability of the token ends and the token is transferrable again.
    /// @dev `transferLockEnd` can be disabled by setting it to 0. It means no end time is set (transfers locked indefinitely).
    uint256 public transferLockEnd;

    /// @notice Initializes the contract with transferability status and non-transferable locking period.
    /// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `transferLockStart_` and `transferLockEnd_`.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    constructor(
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) {
        require(
            transferLockEnd_ == 0 || transferLockEnd_ >= transferLockStart_,
            LSP7InvalidTransferLockPeriod()
        );
        transferable = transferable_;
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;

        emit TransferabilityChanged(transferable_);
        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
    }

    /// @inheritdoc ILSP7NonTransferable
    function isTransferable() public view virtual override returns (bool) {
        if (!transferable) {
            return false;
        }

        bool isTransferLockStartDisabled = transferLockStart == 0;
        bool isTransferLockEndDisabled = transferLockEnd == 0;

        if (isTransferLockStartDisabled && isTransferLockEndDisabled) {
            return true;
        }

        if (isTransferLockStartDisabled && !isTransferLockEndDisabled) {
            return transferLockEnd < block.timestamp;
        }

        if (!isTransferLockStartDisabled && isTransferLockEndDisabled) {
            return transferLockStart > block.timestamp;
        }

        return
            transferLockStart > block.timestamp ||
            transferLockEnd < block.timestamp;
    }

    /// @inheritdoc ILSP7NonTransferable
    function makeTransferable() public virtual override onlyOwner {
        transferable = true;
        transferLockStart = 0;
        transferLockEnd = 0;

        emit TransferLockPeriodChanged(0, 0);
        emit TransferabilityChanged(true);
    }

    /// @inheritdoc ILSP7NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        // When transferLockEnd is 0, it means no end time is set (transfers locked indefinitely after transferLockStart)
        // When transferLockStart is 0, it means no start time is set (transfers locked up until transferLockEnd)
        require(
            newTransferLockEnd == 0 ||
                newTransferLockEnd >= newTransferLockStart,
            LSP7InvalidTransferLockPeriod()
        );

        require(
            newTransferLockStart == 0 || block.timestamp < transferLockStart,
            LSP7CannotUpdateTransferLockPeriod()
        );

        require(
            newTransferLockEnd == 0 || block.timestamp < transferLockEnd,
            LSP7CannotUpdateTransferLockPeriod()
        );

        transferLockStart = newTransferLockStart;
        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    /// @notice Checks if a token transfer is allowed based on transferability status.
    /// @dev Allows burning to address(0) even when transfers are disabled, bypassing transferability restrictions. Reverts with {LSP7TransferDisabled} if the token is non-transferable and the destination is not address(0).
    /// @param to The address receiving the tokens.
    function _nonTransferableCheck(
        address /* from */,
        address to,
        uint256 /* amount */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Allow burning or transferring tokens only if the transferability status is enabled
        require(to == address(0) || isTransferable(), LSP7TransferDisabled());
    }

    /// @notice Hook called before a token transfer to enforce transfer restrictions.
    /// @dev Bypasses transfer restrictions for addresses in the allowlist, allowing them to transfer tokens even when {isTransferable} returns false. For non-allowlisted addresses, applies non-transferable checks.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    /// @param force Whether to force the transfer (passed to _nonTransferableCheck).
    /// @param data Additional data for the transfer (passed to _nonTransferableCheck).
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (isAllowlisted(from)) return;
        _nonTransferableCheck(from, to, amount, force, data);
    }
}
