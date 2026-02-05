// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8AllowlistInitAbstract
} from "../LSP8Allowlist/LSP8AllowlistInitAbstract.sol";

// interfaces
import {ILSP8NonTransferable} from "./ILSP8NonTransferable.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// errors
import {
    LSP8TransferDisabled,
    LSP8InvalidTransferLockPeriod,
    LSP8CannotUpdateTransferLockPeriod,
    LSP8TokenAlreadyTransferable
} from "./LSP8NonTransferableErrors.sol";

/// @title LSP8NonTransferableInitAbstract
/// @dev Abstract contract implementing non-transferable LSP8 token functionality with transfer lock periods and allowlist support.
abstract contract LSP8NonTransferableInitAbstract is
    ILSP8NonTransferable,
    LSP8AllowlistInitAbstract
{
    // solhint-disable not-rely-on-time
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice The start timestamp of the transfer lock period.
    uint256 public transferLockStart;

    /// @notice The end timestamp of the transfer lock period.
    uint256 public transferLockEnd;

    /// @notice Initializes the LSP8NonTransferable contract with base token params, allowlist, and transfer settings.
    /// @dev Initializes the LSP8Allowlist (which initializes LSP8IdentifiableDigitalAsset) and sets transfer settings.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract, added to the allowlist.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param lsp8TokenIdFormat_ The format of tokenIds (= NFTs) that this contract will create.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    function __LSP8NonTransferable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) internal virtual onlyInitializing {
        __LSP8Allowlist_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __LSP8NonTransferable_init_unchained(
            transferLockStart_,
            transferLockEnd_
        );
    }

    /// @notice Unchained initializer for the transfer settings.
    /// @dev Sets lock period.
    /// @param transferLockStart_ The start timestamp of the transfer lock period, 0 to disable.
    /// @param transferLockEnd_ The end timestamp of the transfer lock period, 0 to disable.
    function __LSP8NonTransferable_init_unchained(
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) internal virtual onlyInitializing {
        require(
            transferLockEnd_ == 0 || transferLockEnd_ >= transferLockStart_,
            LSP8InvalidTransferLockPeriod()
        );
        transferLockStart = transferLockStart_;
        transferLockEnd = transferLockEnd_;

        emit TransferLockPeriodChanged(transferLockStart_, transferLockEnd_);
    }

    /// @inheritdoc ILSP8NonTransferable
    function isTransferable() public view virtual override returns (bool) {
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
        require(
            transferLockStart != 0 || transferLockEnd != 0,
            LSP8TokenAlreadyTransferable()
        );

        transferLockStart = 0;
        transferLockEnd = 0;

        emit TransferLockPeriodChanged(0, 0);
    }

    /// @inheritdoc ILSP8NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        // When transferLockEnd is 0, it means no end time is set (transfers locked indefinitely after transferLockStart)
        // When transferLockStart is 0, it means no start time is set (transfers locked up until transferLockEnd)
        require(
            newTransferLockEnd == 0 ||
                newTransferLockEnd >= newTransferLockStart,
            LSP8InvalidTransferLockPeriod()
        );

        require(
            newTransferLockStart == 0 || block.timestamp < transferLockStart,
            LSP8CannotUpdateTransferLockPeriod()
        );

        require(
            newTransferLockEnd == 0 || block.timestamp < transferLockEnd,
            LSP8CannotUpdateTransferLockPeriod()
        );

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
        require(to == address(0) || isTransferable(), LSP8TransferDisabled());
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
