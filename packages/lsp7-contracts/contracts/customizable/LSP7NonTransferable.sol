// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP7Allowlist} from "./LSP7Allowlist.sol";

// interfaces
import {ILSP7NonTransferable} from "./ILSP7NonTransferable.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {
    LSP7TransferDisabled,
    LSP7InvalidTransferLockPeriod,
    LSP7CannotUpdateTransferLockPeriod,
    LSP7CannotUpdateTransferLockEnd
} from "./LSP7NonTransferableErrors.sol";

/// @title LSP7NonTransferable
/// @dev Abstract contract implementing non-transferable LSP7 token functionality with transfer lock periods and allowlist support.
abstract contract LSP7NonTransferable is ILSP7NonTransferable, LSP7Allowlist {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Indicates whether the token is currently transferable.
    bool public transferable;

    /// @notice The start timestamp of the transfer lock period.
    uint256 public transferLockStart;

    /// @notice The end timestamp of the transfer lock period.
    uint256 public transferLockEnd;

    /// @notice Initializes the contract with transferability status and lock period.
    /// @param transferable_ Initial transferability status of the token.
    /// @param transferLockStart_ Start timestamp of the transfer lock period.
    /// @param transferLockEnd_ End timestamp of the transfer lock period.
    constructor(
        bool transferable_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) {
        if (transferLockEnd_ < transferLockStart_) {
            revert LSP7InvalidTransferLockPeriod();
        }
        transferable = transferable_;
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;

        if (transferable_) {
            emit TransferabilityChanged(true);
        } else {
            emit TransferabilityChanged(false);
        }

        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
    }

    /// @inheritdoc ILSP7NonTransferable
    function isTransferable() public view virtual override returns (bool) {
        return
            transferable &&
            (transferLockStart > block.timestamp ||
                transferLockEnd < block.timestamp);
    }

    /// @inheritdoc ILSP7NonTransferable
    function makeTransferable() public virtual override onlyOwner {
        transferable = true;
        emit TransferabilityChanged(true);
    }

    /// @inheritdoc ILSP7NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        if (newTransferLockEnd < newTransferLockStart) {
            revert LSP7InvalidTransferLockPeriod();
        }

        if (block.timestamp >= transferLockStart) {
            revert LSP7CannotUpdateTransferLockPeriod();
        }

        transferLockStart = newTransferLockStart;
        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged(
            newTransferLockStart,
            newTransferLockEnd
        );
    }

    /// @inheritdoc ILSP7NonTransferable
    function updateTransferLockEnd(
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        if (newTransferLockEnd < transferLockStart) {
            revert LSP7InvalidTransferLockPeriod();
        }

        if (block.timestamp >= transferLockEnd) {
            revert LSP7CannotUpdateTransferLockEnd();
        }

        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged(transferLockStart, newTransferLockEnd);
    }

    /// @notice Checks if a token transfer is allowed based on transferability status.
    /// @dev Allows burning to address(0) even when transfers are disabled, bypassing transferability restrictions. Reverts with {LSP7TransferDisabled} if the token is non-transferable and the destination is not address(0).
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    /// @param force Whether to force the transfer (ignored in this implementation).
    /// @param data Additional data for the transfer (ignored in this implementation).
    function _nonTransfrableCheck(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        // Allow burning
        if (to == address(0)) return;
        if (isTransferable()) return;

        revert LSP7TransferDisabled();
    }

    /// @notice Hook called before a token transfer to enforce transfer restrictions.
    /// @dev Bypasses transfer restrictions for addresses in the allowlist, allowing them to transfer tokens even when {isTransferable} returns false. For non-allowlisted addresses, applies non-transferable checks.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    /// @param force Whether to force the transfer (passed to _nonTransfrableCheck).
    /// @param data Additional data for the transfer (passed to _nonTransfrableCheck).
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (isAllowlisted(from)) return;
        _nonTransfrableCheck(from, to, amount, force, data);
    }
}
