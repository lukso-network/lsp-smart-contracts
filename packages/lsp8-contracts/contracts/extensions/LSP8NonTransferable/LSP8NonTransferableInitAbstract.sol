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
    AccessControlExtendedInitAbstract,
    LSP8IdentifiableDigitalAssetInitAbstract
{
    /// @dev `"NON_TRANSFERABLE_BYPASS_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant NON_TRANSFERABLE_BYPASS_ROLE =
        0x4e4f4e5f5452414e5346455241424c455f4259504153535f524f4c4500000000;

    /// @inheritdoc ILSP8NonTransferable
    uint256 public transferLockStart;

    /// @inheritdoc ILSP8NonTransferable
    uint256 public transferLockEnd;

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
        __AccessControlExtended_init(newOwner_);
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
        super._transferOwnership(newOwner);
    }
}
