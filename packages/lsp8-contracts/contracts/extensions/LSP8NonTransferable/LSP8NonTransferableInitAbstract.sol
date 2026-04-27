// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../AccessControlExtended/AccessControlExtendedInitAbstract.sol";

// interfaces
import {ILSP8NonTransferable} from "./ILSP8NonTransferable.sol";

// errors
import {
    LSP8TransferDisabled,
    LSP8InvalidTransferLockPeriod,
    LSP8CannotUpdateTransferLockPeriod,
    LSP8TokenAlreadyTransferable
} from "./LSP8NonTransferableErrors.sol";

/// @title LSP8NonTransferableInitAbstract
/// @dev Abstract contract implementing non-transferable LSP8 token functionality with transfer lock periods and role-based bypass support.
abstract contract LSP8NonTransferableInitAbstract is
    ILSP8NonTransferable,
    LSP8IdentifiableDigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    /// @dev `"NON_TRANSFERABLE_BYPASS_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant NON_TRANSFERABLE_BYPASS_ROLE =
        0x4e4f4e5f5452414e5346455241424c455f4259504153535f524f4c4500000000;

    /// @inheritdoc ILSP8NonTransferable
    uint256 public transferLockStart;

    /// @inheritdoc ILSP8NonTransferable
    uint256 public transferLockEnd;

    /// @inheritdoc ILSP8NonTransferable
    bool public transferLockEnabled;

    /// @notice Initializes the LSP8NonTransferable contract with base token params and transfer settings.
    /// @dev Initializes the LSP8IdentifiableDigitalAsset base, the access control layer and transfer settings.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
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
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        );
        __AccessControlExtended_init();
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
        override(
            AccessControlExtendedInitAbstract,
            LSP8IdentifiableDigitalAssetInitAbstract
        )
        returns (bool)
    {
        return
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId) ||
            LSP8IdentifiableDigitalAssetInitAbstract.supportsInterface(
                interfaceId
            );
    }

    /// @inheritdoc ILSP8NonTransferable
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

        // If the token becomes non-transferable starting at a specific point in time, check if we have reached this lock starting period
        if (isTransferLockStartEnabled && !isTransferLockEndEnabled) {
            return transferLockStart > block.timestamp;
        }

        // This last case checks if we are within the transfer lock period
        return
            transferLockStart > block.timestamp ||
            transferLockEnd < block.timestamp;
    }

    /// @inheritdoc ILSP8NonTransferable
    function makeTransferable() public virtual override onlyOwner {
        require(transferLockEnabled, LSP8TokenAlreadyTransferable());

        transferLockEnabled = false;
        transferLockStart = 0;
        transferLockEnd = 0;

        emit TransferLockPeriodChanged({start: 0, end: 0});
    }

    /// @inheritdoc ILSP8NonTransferable
    function updateTransferLockPeriod(
        uint256 newTransferLockStart,
        uint256 newTransferLockEnd
    ) public virtual override onlyOwner {
        require(transferLockEnabled, LSP8CannotUpdateTransferLockPeriod());

        // When transferLockEnd is 0, it means no end time is set (transfers locked indefinitely after transferLockStart)
        // When transferLockStart is 0, it means no start time is set (transfers locked up until transferLockEnd)
        // Allow to make the token always non-transferable, or ensure the end period for locking transfers is always later than the starting period
        require(
            newTransferLockEnd == 0 ||
                newTransferLockEnd >= newTransferLockStart,
            LSP8InvalidTransferLockPeriod()
        );

        transferLockStart = newTransferLockStart;
        transferLockEnd = newTransferLockEnd;

        emit TransferLockPeriodChanged({
            start: newTransferLockStart,
            end: newTransferLockEnd
        });
    }

    /// @notice Checks if a token transfer is allowed based on transferability status.
    /// @dev Allows burning to address(0) even when transfers are disabled, bypassing transferability restrictions. Reverts with {LSP8TransferDisabled} if the token is non-transferable and the destination is not address(0).
    /// @param to The address receiving the token.
    function _nonTransferableCheck(
        address from,
        address to,
        bytes32 /* tokenId */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        // Allow minting and burning
        if (from == address(0) || to == address(0)) return;

        // transferring tokens only if the transferability status is enabled
        require(isTransferable(), LSP8TransferDisabled());
    }

    /// @notice Hook called before a token transfer to enforce transfer restrictions.
    /// @dev Bypasses transfer restrictions for addresses holding `NON_TRANSFERABLE_BYPASS_ROLE`, allowing them to transfer tokens even when {isTransferable} returns false. For all other addresses, applies non-transferable checks.
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
        if (!hasRole(NON_TRANSFERABLE_BYPASS_ROLE, from)) {
            _nonTransferableCheck(from, to, tokenId, force, data);
        }
        super._beforeTokenTransfer(from, to, tokenId, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant NON_TRANSFERABLE_BYPASS_ROLE to new accounts post-transfer
        _setRoleAdmin(NON_TRANSFERABLE_BYPASS_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }
}
