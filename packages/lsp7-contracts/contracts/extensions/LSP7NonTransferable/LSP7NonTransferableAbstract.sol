// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP7NonTransferable} from "./ILSP7NonTransferable.sol";

// errors
import {
    LSP7TransferDisabled,
    LSP7InvalidTransferLockPeriod,
    LSP7CannotUpdateTransferLockPeriod,
    LSP7TokenAlreadyTransferable
} from "./LSP7NonTransferableErrors.sol";

/// @title LSP7NonTransferableAbstract
/// @dev Abstract contract implementing non-transferable LSP7 token functionality with transfer lock periods and allowlist support.
abstract contract LSP7NonTransferableAbstract is
    ILSP7NonTransferable,
    LSP7DigitalAsset,
    AccessControlExtendedAbstract
{
    /// @dev `"NON_TRANSFERABLE_BYPASS_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant NON_TRANSFERABLE_BYPASS_ROLE =
        0x4e4f4e5f5452414e5346455241424c455f4259504153535f524f4c4500000000;

    /// @inheritdoc ILSP7NonTransferable
    uint256 public transferLockStart;

    /// @inheritdoc ILSP7NonTransferable
    uint256 public transferLockEnd;

    /// @inheritdoc ILSP7NonTransferable
    bool public transferLockEnabled;

    /// @notice Initializes the contract with non-transferable locking period.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    constructor(uint256 transferLockStart_, uint256 transferLockEnd_) {
        require(
            transferLockEnd_ == 0 || transferLockEnd_ >= transferLockStart_,
            LSP7InvalidTransferLockPeriod()
        );
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;
        transferLockEnabled = true;

        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
        _grantRole(NON_TRANSFERABLE_BYPASS_ROLE, owner());
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlExtendedAbstract, LSP7DigitalAsset)
        returns (bool)
    {
        return
            AccessControlExtendedAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAsset.supportsInterface(interfaceId);
    }

    /// @inheritdoc ILSP7NonTransferable
    function isTransferable() public view virtual override returns (bool) {
        if (!transferLockEnabled) return true;

        bool isTransferLockStartEnabled = transferLockStart != 0;
        bool isTransferLockEndEnabled = transferLockEnd != 0;

        // If both lock periods are disabled, the token is transferable
        if (!isTransferLockStartEnabled && !isTransferLockEndEnabled) {
            return true;
        }

        // If the token is non-transferable up to a certain point in time, check if we have passed this period
        if (!isTransferLockStartEnabled && isTransferLockEndEnabled) {
            return transferLockEnd < block.timestamp;
        }

        // If the token becomes non-transferable starting at a specific point in time, check if we have reach this lock starting period
        if (isTransferLockStartEnabled && !isTransferLockEndEnabled) {
            return transferLockStart > block.timestamp;
        }

        // The last case is when the non-transferable feature is enabled is enabled within a certain time period
        return
            transferLockStart > block.timestamp ||
            transferLockEnd < block.timestamp;
    }

    /// @inheritdoc ILSP7NonTransferable
    function makeTransferable() public virtual override onlyOwner {
        require(transferLockEnabled, LSP7TokenAlreadyTransferable());

        transferLockEnabled = false;
        transferLockStart = 0;
        transferLockEnd = 0;

        emit TransferLockPeriodChanged({start: 0, end: 0});
    }

    /// @inheritdoc ILSP7NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        require(transferLockEnabled, LSP7CannotUpdateTransferLockPeriod());

        // When `transferLockEnd` is 0, it means no end time is set (transfers locked indefinitely since `transferLockStart`)
        // When `transferLockStart` is 0, it means no start time is set (transfers locked up until `transferLockEnd`)
        // Allow to make the token always non-transferable, or ensure the end period for locking transfers is always later than the starting period
        require(
            newTransferLockEnd == 0 ||
                newTransferLockEnd >= newTransferLockStart,
            LSP7InvalidTransferLockPeriod()
        );

        transferLockStart = newTransferLockStart;
        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged({
            start: newTransferLockStart,
            end: newTransferLockEnd
        });
    }

    /// @notice Checks if a token transfer is allowed based on transferability status.
    /// @dev Allows burning to address(0) even when transfers are disabled, bypassing transferability restrictions. Reverts with {LSP7TransferDisabled} if the token is non-transferable and the destination is not address(0).
    /// @param to The address receiving the tokens.
    function _nonTransferableCheck(
        address from,
        address to,
        uint256 /* amount */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Allow minting and burning
        if (from == address(0) || to == address(0)) return;

        // transferring tokens only if the transferability status is enabled
        require(isTransferable(), LSP7TransferDisabled());
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
        if (!hasRole(NON_TRANSFERABLE_BYPASS_ROLE, from)) {
            _nonTransferableCheck(from, to, amount, force, data);
        }
        super._beforeTokenTransfer(from, to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant NON_TRANSFERABLE_BYPASS_ROLE to new accounts post-transfer
        _setRoleAdmin(NON_TRANSFERABLE_BYPASS_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }
}
