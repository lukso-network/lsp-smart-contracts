// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// interfaces
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";
import {IAccessControlExtended} from "./IAccessControlExtended.sol";

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// constants
import {
    _INTERFACEID_ACCESSCONTROL,
    _INTERFACEID_ACCESSCONTROLENUMERABLE,
    _INTERFACEID_ACCESSCONTROLEXTENDED
} from "./AccessControlExtendedConstants.sol";

// errors
import {
    AccessControlUnauthorizedAccount,
    AccessControlBadConfirmation
} from "./AccessControlExtendedErrors.sol";

/**
 * @title AccessControlExtendedInitAbstract
 * @dev Proxy/initializable variant of {AccessControlExtendedAbstract}. Uses
 * `__AccessControlExtended_init` / `__AccessControlExtended_init_unchained`
 * instead of a constructor, both guarded by `onlyInitializing`.
 */
abstract contract AccessControlExtendedInitAbstract is
    IAccessControlExtended,
    OwnableUpgradeable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Constants

    /// @dev The default admin role. Value is `bytes32(0)` per OZ convention.
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // --- Storage

    /// @dev Mapping from role to its admin role.
    mapping(bytes32 role => bytes32 adminRole) private _roleAdmins;

    /// @dev Forward lookup: role -> set of member addresses.
    mapping(bytes32 role => EnumerableSet.AddressSet members)
        private _roleMembers;

    /// @dev Reverse lookup: address -> set of roles held.
    mapping(address account => EnumerableSet.Bytes32Set rolesAssigned)
        private _addressRoles;

    // --- Modifier

    /**
     * @dev Modifier that checks the caller has `role`.
     * Reverts with {AccessControlUnauthorizedAccount} if the check fails.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    // --- Initializer

    /**
     * @dev Chained initializer that grants DEFAULT_ADMIN_ROLE to the initial owner,
     * so they appear in enumeration (getRoleMember, rolesOf) and can administer roles from initialization.
     *
     * @param initialOwner_ Initial contract owner who also receives DEFAULT_ADMIN_ROLE.
     */
    function __AccessControlExtended_init(
        address initialOwner_
    ) internal virtual onlyInitializing {
        __AccessControlExtended_init_unchained(initialOwner_);
    }

    /**
     * @dev Standalone initializer. Only grants DEFAULT_ADMIN_ROLE to the owner.
     * Use when the LSP7 base is already initialized through another path.
     *
     * @param initialOwner_ The initial contract owner who also receives DEFAULT_ADMIN_ROLE.
     */
    function __AccessControlExtended_init_unchained(
        address initialOwner_
    ) internal virtual onlyInitializing {
        OwnableUpgradeable._transferOwnership(initialOwner_);
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner_);
    }

    // --- ERC-165

    /**
     * @dev Returns true for {IAccessControl}, {IAccessControlEnumerable} and {IAccessControlExtended}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == _INTERFACEID_ACCESSCONTROL ||
            interfaceId == _INTERFACEID_ACCESSCONTROLENUMERABLE ||
            interfaceId == _INTERFACEID_ACCESSCONTROLEXTENDED;
    }

    // --- IAccessControl

    /// @inheritdoc IAccessControl
    function hasRole(
        bytes32 role,
        address account
    ) public view virtual returns (bool) {
        return _hasRole(role, account);
    }

    /// @inheritdoc IAccessControl
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Grants `role` to `account`.
     *
     * @custom:requirements The caller must hold the admin role for `role`.
     */
    function grantRole(
        bytes32 role,
        address account
    ) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Revokes `role` from `account`. The caller must hold the admin role for `role`.
     *
     * @custom:warning `DEFAULT_ADMIN_ROLE` cannot be removed from the current owner to prevent lockout.
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public virtual onlyRole(getRoleAdmin(role)) {
        require(
            !(role == DEFAULT_ADMIN_ROLE && account == owner()),
            AccessControlUnauthorizedAccount(account, role)
        );
        _revokeRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Allows `msg.sender` to renounce their own `role`. The `callerConfirmation`
     * parameter must equal `msg.sender` to prevent accidental renouncement (OZ pattern).
     * Renouncing triggers data cleanup.
     *
     * @custom:warning The current owner cannot renounce `DEFAULT_ADMIN_ROLE`
     * to prevent locking the contract out of role administration.
     *
     * @custom:events Emits {RoleRevoked} if `msg.sender` currently holds `role` and successfully revokes it for itself.
     */
    function renounceRole(
        bytes32 role,
        address callerConfirmation
    ) public virtual {
        require(
            callerConfirmation == msg.sender,
            AccessControlBadConfirmation()
        );
        require(
            !(role == DEFAULT_ADMIN_ROLE && msg.sender == owner()),
            AccessControlUnauthorizedAccount(msg.sender, role)
        );
        _revokeRole(role, msg.sender);
    }

    // --- IAccessControlEnumerable

    /// @inheritdoc IAccessControlEnumerable
    function getRoleMember(
        bytes32 role,
        uint256 index
    ) public view virtual returns (address) {
        return _roleMembers[role].at(index);
    }

    /// @inheritdoc IAccessControlEnumerable
    function getRoleMemberCount(
        bytes32 role
    ) public view virtual returns (uint256) {
        return _roleMembers[role].length();
    }

    // --- IAccessControlExtended

    /// @inheritdoc IAccessControlExtended
    function rolesOf(
        address account
    ) public view virtual returns (bytes32[] memory) {
        return _addressRoles[account].values();
    }

    /**
     * @notice Returns all members that hold `role`.
     *
     * @dev Convenience function that returns the full membership array in a single call.
     * Equivalent to calling {getRoleMember} for each index from `0` to `getRoleMemberCount(role) - 1`.
     *
     * @param role The role identifier to query members for.
     * @return An array of addresses that currently hold the specified role.
     *
     * @custom:warning This function copies the entire role membership set into memory.
     * For roles with a large number of members, this may consume a significant amount of gas. If calling this function on-chain, consider calling `{getRoleMember}` repeatedly, using `getRoleMemberCount` to know as max index.
     * This function is primarily intended for off-chain usage.
     */
    function getRoleMembers(
        bytes32 role
    ) public view virtual returns (address[] memory) {
        return _roleMembers[role].values();
    }

    // --- Internal functions

    /**
     * @dev Grants `role` to `account`. No-op if the account already holds the role
     * (matching OZ behavior). Updates both forward and reverse lookups.
     *
     * @custom:events {RoleGranted} if the role was newly granted.
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        bool added = _roleMembers[role].add(account);

        if (added) {
            _addressRoles[account].add(role);
            emit RoleGranted({
                role: role,
                account: account,
                sender: msg.sender
            });
        }
    }

    /**
     * @dev Revokes `role` from `account`. No-op if the account does not hold the role.
     * Auto-clears auxiliary data if any exists.
     *
     * @custom:events
     * - {RoleRevoked} if the role was revoked.
     * - {RoleDataChanged} if auxiliary data was cleared.
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        bool removed = _roleMembers[role].remove(account);

        if (removed) {
            _addressRoles[account].remove(role);
            emit RoleRevoked({
                role: role,
                account: account,
                sender: msg.sender
            });
        }
    }

    /**
     * @dev Checks that `msg.sender` has `role`. Reverts with
     * {AccessControlUnauthorizedAccount} if the check fails.
     *
     * @custom:warning Overriding this function changes the behavior of the {onlyRole} modifier.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, msg.sender);
    }

    /**
     * @dev Checks that `account` has `role`.
     *
     * Reverts with {AccessControlUnauthorizedAccount} if the account does not
     * explicitly hold the role.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        require(
            _hasRole(role, account),
            AccessControlUnauthorizedAccount(account, role)
        );
    }

    function _hasRole(
        bytes32 role,
        address account
    ) internal view virtual returns (bool) {
        return _roleMembers[role].contains(account);
    }

    /**
     * @dev Sets `adminRole` as the admin of `role`. Available for extensions
     * to configure custom admin hierarchies.
     *
     * @custom:warning DO NOT expose this function without `onlyOwner` or `onlyRole(DEFAULT_ADMIN_ROLE)` access control.
     *
     * @custom:events {RoleAdminChanged} with the previous and new admin roles.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roleAdmins[role] = adminRole;
        emit RoleAdminChanged({
            role: role,
            previousAdminRole: previousAdminRole,
            newAdminRole: adminRole
        });
    }

    // --- Ownership sync

    /**
     * @dev Overrides `_transferOwnership` to automatically transfer ALL roles held by
     * the old owner to the new owner. This includes `DEFAULT_ADMIN_ROLE` and any other
     * custom roles the old owner was assigned.
     *
     * For each role held by the old owner:
     * 1. The role is revoked from the old owner (including clearing auxiliary data).
     * 2. The role is granted to the new owner (if not already held).
     *
     * @custom:info When renouncing ownership, roles are only removed from the old owner. Roles are not passed to `address(0)` (being the `newOwner` in the case of renounce ownership).
     *
     * @custom:warning
     * - Gas cost scales linearly with the number of roles the old owner holds.
     * - Auxiliary role data set on the old owner is transferred to the new owner if ownership is transferred.
     * - Transferring ownership to self will still clear then restore the old owner's auxiliary role data.
     * - If the old owner holds a large number of roles, the transaction may approach or exceed
     *   the block gas limit and fail. Avoid assigning too many roles to the owner to ensure
     *   ownership transfers remain callable.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        address oldOwner = owner();
        OwnableUpgradeable._transferOwnership(newOwner);

        // Snapshot the old owner's roles before mutating storage (values() returns a memory copy)
        bytes32[] memory oldOwnerRoles = _addressRoles[oldOwner].values();

        for (uint256 ii = 0; ii < oldOwnerRoles.length; ++ii) {
            bytes32 role = oldOwnerRoles[ii];

            _revokeRole(role, oldOwner);

            // exclude case when renouncing ownership
            if (newOwner != address(0)) {
                _grantRole(role, newOwner);
            }
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     *
     * @custom:info The size of the `__gap` array is calculated so that the amount of storage used by the contract
     * always adds up to the same number (in this case 50 storage slots).
     */
    uint256[47] private __gap;
}
