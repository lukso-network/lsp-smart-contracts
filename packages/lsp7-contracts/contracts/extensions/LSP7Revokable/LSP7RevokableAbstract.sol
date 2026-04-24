// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../AccessControlExtended/AccessControlExtendedAbstract.sol";

// interfaces
import {ILSP7Revokable} from "./ILSP7Revokable.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../AccessControlExtended/AccessControlExtendedErrors.sol";
import {LSP7RevokableFeatureDisabled} from "./LSP7RevokableErrors.sol";

/// @title LSP7RevokableAbstract
/// @dev Abstract contract implementing revokable functionality for LSP7 tokens.
/// Allows addresses with the `REVOKER_ROLE` to revoke tokens from any holder
/// back to the contract owner or any other address that also has revoke rights.
///
/// Use cases include:
/// - Memberships: Revoke membership tokens when they expire or are terminated
/// - Role badges: Remove role badges from community members
/// - Compliance: Freeze or reverse tokens for regulatory requirements
/// - Vesting: Revoke unvested tokens if conditions are not met
abstract contract LSP7RevokableAbstract is
    ILSP7Revokable,
    LSP7DigitalAsset,
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

    /// @inheritdoc ILSP7Revokable
    function isRevokable() public view virtual override returns (bool) {
        return _IS_REVOKABLE;
    }

    /// @inheritdoc ILSP7Revokable
    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyRole(REVOKER_ROLE) {
        require(isRevokable(), LSP7RevokableFeatureDisabled());
        require(
            to == owner() || hasRole(REVOKER_ROLE, to),
            AccessControlUnauthorizedAccount(to, REVOKER_ROLE)
        );

        // We assume revokers are trusted when specifying revocation destinations.
        // Therefore, we bypass LSP1 receiver checks.
        _transfer({
            from: from,
            to: to,
            amount: amount,
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
        override(AccessControlExtendedAbstract, LSP7DigitalAsset)
        returns (bool)
    {
        return
            AccessControlExtendedAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAsset.supportsInterface(interfaceId);
    }

    /// @dev Overridden function to ensure previous revokers do not persist after contract ownership has been transferred.
    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant REVOKER_ROLE to new accounts post-transfer
        _setRoleAdmin(REVOKER_ROLE, DEFAULT_ADMIN_ROLE);
        _clearRevokers();
        super._transferOwnership(newOwner);
    }

    function _clearRevokers() internal virtual {
        while (getRoleMemberCount(REVOKER_ROLE) != 0) {
            _revokeRole(REVOKER_ROLE, getRoleMember(REVOKER_ROLE, 0));
        }
    }
}
