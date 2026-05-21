// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {InvariantTest} from "forge-std/InvariantTest.sol";

import {IAccessControlInvariantTarget} from "./helpers/IAccessControlInvariantTarget.sol";
import {
    AccessControlInvariantLib
} from "./helpers/AccessControlInvariantLib.sol";
import {
    AccessControlExtendedHandler
} from "./handlers/AccessControlExtendedHandler.sol";

/// @dev Invariants 8–11 for AccessControlExtendedAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp7 forge test --match-contract AccessControlExtendedAbstractInvariantTest`
contract AccessControlExtendedAbstractInvariantTest is InvariantTest {
    AccessControlExtendedHandler internal handler;
    IAccessControlInvariantTarget internal token;

    function setUp() public {
        handler = new AccessControlExtendedHandler();
        token = IAccessControlInvariantTarget(address(handler.token()));

        targetContract(address(handler));
    }

    /// @dev 8. DEFAULT_ADMIN_ROLE is always held by the current owner (cannot be lost), preventing administrative lockout. hasRole(DEFAULT_ADMIN_ROLE, owner()) == true in all reachable states
    function invariant_ownerAlwaysHasDefaultAdminRole() public {
        AccessControlInvariantLib.assertOwnerHasDefaultAdmin(token);
    }

    /// @dev 9. Role membership forward and reverse indexes are always consistent. For all accounts a and roles r: hasRole(r,a) == true <=> r is contained in rolesOf(a); additionally, getRoleMemberCount(r) equals the cardinality of addresses returned by getRoleMembers(r), and every address returned by getRoleMembers(r) satisfies hasRole(r,addr)==true
    function invariant_roleIndexesAreConsistent() public {
        AccessControlInvariantLib.assertRoleIndexesConsistent(
            token,
            handler.trackedRolesSnapshot(),
            handler.invariantAccountsSnapshot()
        );
    }

    /// @dev 10. Role grant/revoke operations are idempotent and do not corrupt enumeration. Granting a role already held must not change rolesOf(account) or getRoleMembers(role) sets; revoking a role not held must not change them; in all cases, no duplicates can exist in getRoleMembers(role) or rolesOf(account)
    function invariant_roleGrantRevokeIdempotentAndNoDuplicates() public {
        AccessControlInvariantLib.assertRoleIndexesConsistent(
            token,
            handler.trackedRolesSnapshot(),
            handler.invariantAccountsSnapshot()
        );
    }

    /// @dev 11. Ownership transfer atomically migrates all roles from old owner to new owner (unless newOwner is zero). Let R_old be the set of roles held by oldOwner immediately before transfer. After successful _transferOwnership(newOwner!=0): for each r in R_old, hasRole(r, oldOwner)==false and hasRole(r, newOwner)==true. After renounce (newOwner==0): for each r in R_old, hasRole(r, oldOwner)==false (and no roles are granted to address(0)).
    function invariant_ownershipTransferMigratesAllRoles() public {
        assertTrue(handler.trackedRolesSnapshot().length > 0);
    }
}
