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
import {ILSP8Revokable} from "./ILSP8Revokable.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../AccessControlExtended/AccessControlExtendedErrors.sol";
import {LSP8RevokableFeatureDisabled} from "./LSP8RevokableErrors.sol";

/// @title LSP8RevokableAbstract
/// @dev Abstract contract implementing revokable functionality for LSP8 tokens.
/// Allows addresses with the `REVOKER_ROLE` to revoke NFTs from any holder
/// back to the contract owner or any other address that also has revoke rights.
///
/// Use cases include:
/// - Memberships: Revoke membership NFTs when they expire or are terminated
/// - Role badges: Remove role badge NFTs from community members
/// - Compliance: Freeze or reverse NFTs for regulatory requirements
/// - Ticketing: Reclaim tickets or access NFTs when conditions are no longer met
abstract contract LSP8RevokableAbstract is
    ILSP8Revokable,
    LSP8IdentifiableDigitalAsset,
    AccessControlExtendedAbstract
{
    bool internal immutable _IS_REVOKABLE;

    /// @dev `"REVOKER_ROLE"` as utf8 hex (zero padded on the right to 32 bytes)
    bytes32 public constant REVOKER_ROLE =
        0x5245564f4b45525f524f4c450000000000000000000000000000000000000000;

    constructor(bool isRevokable_) {
        _IS_REVOKABLE = isRevokable_;

        if (isRevokable_) {
            _grantRole(REVOKER_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP8Revokable
    function isRevokable() public view virtual override returns (bool) {
        return _IS_REVOKABLE;
    }

    /// @inheritdoc ILSP8Revokable
    function revoke(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) public virtual override onlyRole(REVOKER_ROLE) {
        require(isRevokable(), LSP8RevokableFeatureDisabled());
        require(
            to == owner() || hasRole(REVOKER_ROLE, to),
            AccessControlUnauthorizedAccount(to, REVOKER_ROLE)
        );

        // We assume revokers are trusted when specifying revocation destinations.
        // Therefore, we bypass LSP1 receiver checks.
        _transfer({
            from: from,
            to: to,
            tokenId: tokenId,
            force: true,
            data: data
        });
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

    /// @dev Overridden function to ensure previous revokers do not persist after contract ownership has been transferred.
    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        _clearRevokers();
        super._transferOwnership(newOwner);
    }

    function _clearRevokers() internal virtual {
        while (getRoleMemberCount(REVOKER_ROLE) != 0) {
            _revokeRole(REVOKER_ROLE, getRoleMember(REVOKER_ROLE, 0));
        }
    }
}
