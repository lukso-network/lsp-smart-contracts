// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8NonTransferable
/// @dev Interface for a non-transferable LSP8 token, enabling control over transferability, lock periods, and allowlist exemptions.
interface ILSP8NonTransferable {
    /// @dev Emitted when the transfer lock period is updated.
    /// @param start The new start timestamp of the transfer lock period.
    /// @param end The new end timestamp of the transfer lock period.
    event TransferLockPeriodChanged(uint256 indexed start, uint256 indexed end);

    /// @dev Emitted when the token's transferability status changes.
    /// @param enabled True if transferability is enabled, false if disabled.
    event TransferabilityChanged(bool indexed enabled);

    /// @notice Checks if the token is currently transferable.
    /// @dev Returns true if the token is transferable (based on the transferable flag and lock period). Note that transfers from allowlisted addresses and burning (transfers to address(0)) is always allowed, regardless of transferability status.
    /// @return True if the token is transferable, false otherwise.
    function isTransferable() external view returns (bool);

    /// @notice Removes all transfer lock, enabling token transfers for non-allowlisted addresses outside the lock period.
    /// @dev Can only be called by the contract owner. Sets the transferable flag to true, and emits a {TransferabilityChanged} event with enabled set to true.
    /// @custom:emits {TransferLockPeriodChanged} event.
    /// @custom:emits {TransferabilityChanged} event.
    function makeTransferable() external;

    /// @notice Updates the transfer lock period with new start and end timestamps.
    /// @dev Can only be called by the contract owner. Reverts if the current lock period has already started or ended.
    /// @custom:emits {TransferLockPeriodChanged} event.
    /// @param newTransferLockStart The new start timestamp for the transfer lock period.
    /// @param newTransferLockEnd The new end timestamp for the transfer lock period.
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) external;
}
