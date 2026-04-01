// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../AccessControlExtended/AccessControlExtendedInitAbstract.sol";

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
    LSP7TokenAlreadyTransferable
} from "./LSP7NonTransferableErrors.sol";

/// @title LSP7NonTransferableInitAbstract
/// @dev Abstract contract implementing non-transferable LSP7 token functionality with transfer lock periods and allowlist support.
abstract contract LSP7NonTransferableInitAbstract is
    ILSP7NonTransferable,
    AccessControlExtendedInitAbstract,
    LSP7DigitalAssetInitAbstract
{
    // solhint-disable not-rely-on-time
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev `"NON_TRANSFERABLE_BYPASS_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant NON_TRANSFERABLE_BYPASS_ROLE =
        0x4e4f4e5f5452414e5346455241424c455f4259504153535f524f4c4500000000;

    /// @inheritdoc ILSP7NonTransferable
    uint256 public transferLockStart;

    /// @inheritdoc ILSP7NonTransferable
    uint256 public transferLockEnd;

    /// @inheritdoc ILSP7NonTransferable
    bool public transferLockEnabled;

    /// @notice Initializes the LSP7NonTransferable contract with base token params, allowlist, and transfer settings.
    /// @dev Initializes the LSP7Allowlist (which initializes LSP7DigitalAsset) and sets the lock period.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract, added to the allowlist.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    function __LSP7NonTransferable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init(newOwner_);
        __LSP7NonTransferable_init_unchained(
            transferLockStart_,
            transferLockEnd_
        );
    }

    /// @notice Unchained initializer for the lock period.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    function __LSP7NonTransferable_init_unchained(
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) internal virtual onlyInitializing {
        require(
            transferLockEnd_ == 0 || transferLockEnd_ >= transferLockStart_,
            LSP7InvalidTransferLockPeriod()
        );
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;
        transferLockEnabled = true;

        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
        _grantRole(NON_TRANSFERABLE_BYPASS_ROLE, address(0));
        _grantRole(NON_TRANSFERABLE_BYPASS_ROLE, owner());

        // grant role to allow minting tokens (`from == address(0)`)
        _grantRole(NON_TRANSFERABLE_BYPASS_ROLE, address(0));
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            AccessControlExtendedInitAbstract,
            LSP7DigitalAssetInitAbstract
        )
        returns (bool)
    {
        return
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAssetInitAbstract.supportsInterface(interfaceId);
    }

    /// @inheritdoc ILSP7NonTransferable
    function isTransferable() public view virtual override returns (bool) {
        if (!transferLockEnabled) {
            return true;
        }

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

        emit TransferLockPeriodChanged(0, 0);
    }

    /// @inheritdoc ILSP7NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        require(transferLockEnabled, LSP7CannotUpdateTransferLockPeriod());

        // When transferLockEnd is 0, it means no end time is set (transfers locked indefinitely after transferLockStart)
        // When transferLockStart is 0, it means no start time is set (transfers locked up until transferLockEnd)
        require(
            newTransferLockEnd == 0 ||
                newTransferLockEnd >= newTransferLockStart,
            LSP7InvalidTransferLockPeriod()
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
        if (!hasRole(NON_TRANSFERABLE_BYPASS_ROLE, from)) {
            _nonTransferableCheck(from, to, amount, force, data);
        }
        super._beforeTokenTransfer(from, to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        super._transferOwnership(newOwner);
    }
}
