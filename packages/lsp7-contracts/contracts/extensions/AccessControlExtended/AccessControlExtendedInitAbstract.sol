// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAssetInitAbstract.sol";

// interfaces
import {
    IAccessControlExtended
} from "./IAccessControlExtended.sol";
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// constants
import {
    _INTERFACEID_ACCESSCONTROLEXTENDED
} from "./AccessControlExtendedConstants.sol";

// errors
import {
    AccessControlExtendedUnauthorized,
    AccessControlExtendedCanOnlyRenounceForSelf
} from "./AccessControlExtendedErrors.sol";

/**
 * @title AccessControlExtendedInitAbstract
 * @dev Proxy/initializable variant of {AccessControlExtendedAbstract}. Uses
 * `__AccessControlExtended_init` / `__AccessControlExtended_init_unchained`
 * instead of a constructor, both guarded by `onlyInitializing`.
 *
 * All function implementations are identical to {AccessControlExtendedAbstract}.
 * The only differences are:
 * 1. Inherits {LSP7DigitalAssetInitAbstract} instead of {LSP7DigitalAsset}
 * 2. Uses initializer functions instead of a constructor
 *
 * @custom:info No storage gaps needed since all storage is mapping-based (hashed slots).
 */
abstract contract AccessControlExtendedInitAbstract is
    IAccessControlExtended,
    LSP7DigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Constants

    /// @dev The default admin role. Value is `bytes32(0)` per OZ convention.
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // --- Storage

    /// @dev Mapping from role to its admin role.
    mapping(bytes32 => bytes32) private _roleAdmins;

    /// @dev Forward lookup: role -> set of member addresses.
    mapping(bytes32 => EnumerableSet.AddressSet) private _roleMembers;

    /// @dev Reverse lookup: address -> set of roles held.
    mapping(address => EnumerableSet.Bytes32Set) private _addressRoles;

    /// @dev Auxiliary data: role -> address -> bytes.
    mapping(bytes32 => mapping(address => bytes)) private _roleData;

    // --- Modifier

    /**
     * @dev Modifier that checks the caller has `role` (or is owner / DEFAULT_ADMIN_ROLE holder).
     * Reverts with {AccessControlExtendedUnauthorized} if the check fails.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    // --- Initializer

    /**
     * @dev Chained initializer. Initializes the LSP7 base and grants DEFAULT_ADMIN_ROLE.
     *
     * @param name_ Token name.
     * @param symbol_ Token symbol.
     * @param newOwner_ Initial owner who receives DEFAULT_ADMIN_ROLE.
     * @param lsp4TokenType_ The LSP4 token type.
     * @param isNonDivisible_ Whether the token is non-divisible.
     */
    function __AccessControlExtended_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init_unchained(newOwner_);
    }

    /**
     * @dev Standalone initializer. Only grants DEFAULT_ADMIN_ROLE to the owner.
     * Use when the LSP7 base is already initialized through another path.
     *
     * @param newOwner_ The owner who receives DEFAULT_ADMIN_ROLE.
     */
    function __AccessControlExtended_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner_);
    }

    // --- ERC-165

    /**
     * @dev Returns true for {IAccessControl}, {IAccessControlEnumerable},
     * {IAccessControlExtended}, and all interfaces supported by {LSP7DigitalAssetInitAbstract}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IAccessControlEnumerable).interfaceId ||
            interfaceId == _INTERFACEID_ACCESSCONTROLEXTENDED ||
            super.supportsInterface(interfaceId);
    }

    // --- IAccessControl

    /// @inheritdoc IAccessControl
    function hasRole(
        bytes32 role,
        address account
    ) public view virtual returns (bool) {
        return _roleMembers[role].contains(account);
    }

    /// @inheritdoc IAccessControl
    function getRoleAdmin(
        bytes32 role
    ) public view virtual returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Grants `role` to `account`. The caller must hold the admin role for `role`
     * (or be the contract owner / DEFAULT_ADMIN_ROLE holder).
     */
    function grantRole(
        bytes32 role,
        address account
    ) public virtual {
        _checkRole(getRoleAdmin(role));
        _grantRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Revokes `role` from `account`. The caller must hold the admin role for `role`
     * (or be the contract owner / DEFAULT_ADMIN_ROLE holder).
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public virtual {
        _checkRole(getRoleAdmin(role));
        _revokeRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Allows `msg.sender` to renounce their own `role`. The `callerConfirmation`
     * parameter must equal `msg.sender` to prevent accidental renouncement (OZ pattern).
     * Renouncing triggers data cleanup per BASE-09.
     */
    function renounceRole(
        bytes32 role,
        address callerConfirmation
    ) public virtual {
        if (callerConfirmation != msg.sender) {
            revert AccessControlExtendedCanOnlyRenounceForSelf(
                msg.sender,
                callerConfirmation
            );
        }
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
     * @inheritdoc IAccessControlExtended
     * @dev Atomically grants `role` to `account` and stores `data`.
     * If `account` already holds the role (_grantRole is a no-op), the data
     * is still updated if provided and {RoleDataChanged} is emitted.
     */
    function grantRoleWithData(
        bytes32 role,
        address account,
        bytes calldata data
    ) public virtual {
        _checkRole(getRoleAdmin(role));
        _grantRole(role, account);
        if (data.length > 0) {
            _roleData[role][account] = data;
            emit RoleDataChanged(role, account, data);
        }
    }

    /**
     * @inheritdoc IAccessControlExtended
     * @dev Sets auxiliary data for a role-address pair. Does NOT revert if `account`
     * does not hold the role (allows pre-configuration before granting).
     * Requires the caller to have the admin role for `role`.
     */
    function setRoleData(
        bytes32 role,
        address account,
        bytes calldata data
    ) public virtual {
        _checkRole(getRoleAdmin(role));
        _roleData[role][account] = data;
        emit RoleDataChanged(role, account, data);
    }

    /// @inheritdoc IAccessControlExtended
    function getRoleData(
        bytes32 role,
        address account
    ) public view virtual returns (bytes memory) {
        return _roleData[role][account];
    }

    // --- Internal functions

    /**
     * @dev Grants `role` to `account`. No-op if the account already holds the role
     * (matching OZ behavior). Updates both forward and reverse lookups.
     *
     * @custom:events {RoleGranted} if the role was newly granted.
     */
    function _grantRole(
        bytes32 role,
        address account
    ) internal virtual {
        if (_roleMembers[role].add(account)) {
            _addressRoles[account].add(role);
            emit RoleGranted(role, account, msg.sender);
        }
    }

    /**
     * @dev Revokes `role` from `account`. No-op if the account does not hold the role.
     * Auto-clears auxiliary data if any exists (BASE-09).
     *
     * @custom:events
     * - {RoleRevoked} if the role was revoked.
     * - {RoleDataChanged} if auxiliary data was cleared.
     */
    function _revokeRole(
        bytes32 role,
        address account
    ) internal virtual {
        if (_roleMembers[role].remove(account)) {
            _addressRoles[account].remove(role);
            emit RoleRevoked(role, account, msg.sender);

            // Auto-clear auxiliary data (BASE-09)
            if (_roleData[role][account].length > 0) {
                delete _roleData[role][account];
                emit RoleDataChanged(role, account, "");
            }
        }
    }

    /**
     * @dev Checks that `msg.sender` has `role`. Reverts with
     * {AccessControlExtendedUnauthorized} if the check fails.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, msg.sender);
    }

    /**
     * @dev Checks that `account` has `role`, with three bypass paths:
     * 1. `account == owner()` -- owner implicitly passes all checks
     * 2. `account` holds `DEFAULT_ADMIN_ROLE` -- root admin for all roles
     * 3. `account` holds `role` -- standard role check
     *
     * Reverts with {AccessControlExtendedUnauthorized} if none of the above hold.
     */
    function _checkRole(
        bytes32 role,
        address account
    ) internal view virtual {
        // Owner implicitly passes all checks
        if (account == owner()) return;

        // DEFAULT_ADMIN_ROLE is root admin for ALL roles
        if (hasRole(DEFAULT_ADMIN_ROLE, account)) return;

        // Standard role check
        if (!hasRole(role, account)) {
            revert AccessControlExtendedUnauthorized(account, role);
        }
    }

    /**
     * @dev Sets `adminRole` as the admin of `role`. Available for extensions
     * to configure custom admin hierarchies.
     *
     * @custom:events {RoleAdminChanged} with the previous and new admin roles.
     */
    function _setRoleAdmin(
        bytes32 role,
        bytes32 adminRole
    ) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roleAdmins[role] = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    // --- Ownership sync

    /**
     * @dev Overrides `_transferOwnership` to automatically sync `DEFAULT_ADMIN_ROLE`
     * with the contract owner. Revokes from the old owner and grants to the new owner.
     */
    function _transferOwnership(
        address newOwner
    ) internal virtual override {
        address oldOwner = owner();
        super._transferOwnership(newOwner);
        if (oldOwner != address(0)) {
            _revokeRole(DEFAULT_ADMIN_ROLE, oldOwner);
        }
        if (newOwner != address(0)) {
            _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        }
    }
}
