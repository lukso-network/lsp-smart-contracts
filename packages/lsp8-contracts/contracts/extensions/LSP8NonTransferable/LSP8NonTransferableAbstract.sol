// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// modules
import {LSP8AllowlistAbstract} from "../LSP8Allowlist/LSP8AllowlistAbstract.sol";

// interfaces
import {ILSP8NonTransferable} from "./ILSP8NonTransferable.sol";

// libraries
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {
    LSP8TransferDisabled,
    LSP8InvalidTransferLockPeriod,
    LSP8CannotUpdateTransferLockPeriod
} from "./LSP8NonTransferableErrors.sol";

/// @title LSP8NonTransferableAbstract
/// @dev Abstract contract implementing non-transferable LSP8 token functionality with transfer lock periods and allowlist support.
abstract contract LSP8NonTransferableAbstract is
    ILSP8NonTransferable,
    LSP8AllowlistAbstract
{
    // solhint-disable not-rely-on-time
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Indicates whether the token is currently transferable.
    bool public transferable;

    /// @notice The start timestamp of the transfer lock period.
    uint256 public transferLockStart;

    /// @notice The end timestamp of the transfer lock period.
    uint256 public transferLockEnd;

    /// @notice Initializes the contract with transferability status and lock period.
    /// @param transferable_ True to enable transfers, false to prevent transfers, or defined via `nonTransferableFrom_` and `nonTransferableUntil_`.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    constructor(
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) {
        if (transferLockEnd_ != 0 && transferLockEnd_ < transferLockStart_) {
            revert LSP8InvalidTransferLockPeriod();
        }
        transferable = transferable_;
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;

        emit TransferabilityChanged(transferable_);
        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
    }

    /// @inheritdoc ILSP8NonTransferable
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

    /// @inheritdoc ILSP8NonTransferable
    function makeTransferable() public virtual override onlyOwner {
        transferable = true;
        transferLockStart = 0;
        transferLockEnd = 0;

        emit TransferLockPeriodChanged(0, 0);
        emit TransferabilityChanged(true);
    }

    /// @inheritdoc ILSP8NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        // When transferLockEnd is 0, it means no end time is set (transfers locked indefinitely after transferLockStart)
        // When transferLockStart is 0, it means no start time is set (transfers locked up until transferLockEnd)
        if (
            newTransferLockEnd != 0 && newTransferLockEnd < newTransferLockStart
        ) {
            revert LSP8InvalidTransferLockPeriod();
        }

        if (newTransferLockStart != 0 && block.timestamp >= transferLockStart) {
            revert LSP8CannotUpdateTransferLockPeriod();
        }

        if (newTransferLockEnd != 0 && block.timestamp >= transferLockEnd) {
            revert LSP8CannotUpdateTransferLockPeriod();
        }

        transferLockStart = newTransferLockStart;
        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    /// @notice Checks if a token transfer is allowed based on transferability status.
    /// @dev Allows burning to address(0) even when transfers are disabled, bypassing transferability restrictions. Reverts with {LSP8TransferDisabled} if the token is non-transferable and the destination is not address(0).
    /// @param to The address receiving the token.
    function _nonTransferableCheck(
        address /* from */,
        address to,
        bytes32 /* tokenId */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Allow burning
        if (to == address(0)) return;
        if (isTransferable()) return;

        revert LSP8TransferDisabled();
    }

    /// @notice Hook called before a token transfer to enforce transfer restrictions.
    /// @dev Bypasses transfer restrictions for addresses in the allowlist, allowing them to transfer tokens even when {isTransferable} returns false. For non-allowlisted addresses, applies non-transferable checks.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param tokenId The unique identifier of the token being transferred.
    /// @param force Whether to force the transfer (passed to _nonTransferableCheck).
    /// @param data Additional data for the transfer (passed to _nonTransferableCheck).
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (isAllowlisted(from)) return;
        _nonTransferableCheck(from, to, tokenId, force, data);
    }
}
