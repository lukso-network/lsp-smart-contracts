// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP8CappedBalance} from "./ILSP8CappedBalance.sol";

// errors
import {LSP8CappedBalanceExceeded} from "./LSP8CappedBalanceErrors.sol";

/// @title LSP8CappedBalanceAbstract
/// @dev Abstract contract implementing a per-address NFT count cap for LSP8 tokens, with role-based exemptions.
abstract contract LSP8CappedBalanceAbstract is
    ILSP8CappedBalance,
    AccessControlExtendedAbstract,
    LSP8IdentifiableDigitalAsset
{
    /// @notice The dead address is also commonly used for burning tokens as an alternative to address(0).
    address internal constant _DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    /// @notice The immutable maximum number of NFTs allowed per address.
    uint256 private immutable _TOKEN_BALANCE_CAP;

    /// @dev `"UNCAPPED_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant UNCAPPED_ROLE =
        0x554e4341505045445f524f4c4500000000000000000000000000000000000000;

    /// @notice Initializes the contract with a token balance cap.
    /// @dev Sets the immutable balance cap and grants the initial uncapped-role exemptions.
    /// @param tokenBalanceCap_ The maximum number of NFTs per address, 0 to disable.
    constructor(uint256 tokenBalanceCap_) {
        _TOKEN_BALANCE_CAP = tokenBalanceCap_;
        _grantRole(UNCAPPED_ROLE, owner());
    }

    /// @inheritdoc ILSP8CappedBalance
    function tokenBalanceCap() public view virtual override returns (uint256) {
        return _TOKEN_BALANCE_CAP;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlExtendedAbstract, LSP8IdentifiableDigitalAsset)
        returns (bool)
    {
        return
            AccessControlExtendedAbstract.supportsInterface(interfaceId) ||
            LSP8IdentifiableDigitalAsset.supportsInterface(interfaceId);
    }

    /// @notice Checks if a token transfer complies with the balance cap.
    /// @dev The address(0) is not subject to balance cap checks as this address is used for burning tokens. Reverts with {LSP8CappedBalanceExceeded} if the recipient's NFT count after receiving the token would exceed the maximum allowed.
    /// @param to The address receiving the token.
    function _tokenBalanceCapCheck(
        address /* from */,
        address to,
        bytes32 /* tokenId */,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual {
        if (hasRole(UNCAPPED_ROLE, to)) return;

        require(
            to == address(0) ||
                to == _DEAD_ADDRESS ||
                tokenBalanceCap() == 0 ||
                balanceOf(to) + 1 <= tokenBalanceCap(),
            LSP8CappedBalanceExceeded(to, balanceOf(to), tokenBalanceCap())
        );
    }

    /// @notice Hook called before a token transfer to enforce balance cap restrictions.
    /// @dev Bypasses balance cap checks for recipients holding `UNCAPPED_ROLE`. Applies cap checks for all other recipients.
    /// @param from The address sending the token.
    /// @param to The address receiving the token.
    /// @param tokenId The unique identifier of the token being transferred.
    /// @param force Whether to force the transfer.
    /// @param data Additional data for the transfer.
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) internal virtual override {
        _tokenBalanceCapCheck(from, to, tokenId, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        super._transferOwnership(newOwner);
    }
}
