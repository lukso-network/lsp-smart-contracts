// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8NonTransferable
/// @dev Interface for a non-transferable LSP8 token, enabling control over transferability, lock periods, and allowlist exemptions.
interface ILSP8NonTransferable {
    /// @dev Emitted when the transfer lock period is updated.
    /// @param start The new start timestamp of the transfer lock period.
    /// @param end The new end timestamp of the transfer lock period.
    event TransferLockPeriodChanged(uint256 indexed start, uint256 indexed end);

    /// @notice The start timestamp of the transfer lock period, at which point the token becomes non-transferable.
    function transferLockStart() external view returns (uint256);

    /// @notice The end timestamp of the transfer lock period, at which point the token becomes transferable again.
    function transferLockEnd() external view returns (uint256);

    /// @notice Checks if the token is currently transferable.
    /// @dev Returns true if the token is transferable (based on the lock period). Note that transfers from allowlisted addresses and burning (transfers to address(0)) is always allowed, regardless of transferability status.
    /// @return True if the token is transferable, false otherwise.
    function isTransferable() external view returns (bool);

    /// @notice Removes all transfer lock, enabling token transfers for non-allowlisted addresses.
    /// @dev Can only be called by the contract owner. Sets both lock periods to 0.
    /// @custom:emits {TransferLockPeriodChanged} event.
    function makeTransferable() external;

    /// @notice Updates the transfer lock period with new start and end timestamps.
    /// - When `transferLockStart` is 0 and `transferLockEnd` is set to a non-zero value, it means no start time is set. The token is non-transferable immediately until `transferLockEnd`.
    /// - When `transferLockStart` is set to a value and `transferLockEnd` is 0, it means the tokens becomes non-transferable at a certain point in time and indefinitely (no end time).
    ///
    /// - To make the token always non-transferable, set `transferLockStart` to 0 and `transferLockEnd` to type(uint256).max.
    /// - To disable completely the non-transferable feature (= make the token always transferable), set both `transferLockStart` and `transferLockEnd` to 0.
    ///
    /// @dev Can only be called by the contract owner. Reverts if the current lock period has already started or ended.
    ///
    /// @custom:emits {TransferLockPeriodChanged} event.
    /// @param newTransferLockStart The new start timestamp for the transfer lock period.
    /// @param newTransferLockEnd The new end timestamp for the transfer lock period.
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) external;
}
