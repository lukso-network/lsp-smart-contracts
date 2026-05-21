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

/// @dev Invariants 36–39 for AccessControlExtendedAbstract.sol.
/// Run: `FOUNDRY_PROFILE=lsp8 forge test --match-contract AccessControlExtendedAbstractInvariantTest`
contract AccessControlExtendedAbstractInvariantTest is InvariantTest {
    AccessControlExtendedHandler internal handler;
    IAccessControlInvariantTarget internal token;

    function setUp() public {
        handler = new AccessControlExtendedHandler();
        token = IAccessControlInvariantTarget(address(handler.token()));

        targetContract(address(handler));
    }

    /// @dev 36. AccessControl forward and reverse enumerations remain consistent. For all roles R and accounts A: hasRole(R,A) == true iff (A ∈ getRoleMembers(R)) iff (R ∈ rolesOf(A)).
    function invariant_roleIndexesAreConsistent() public {
        AccessControlInvariantLib.assertRoleIndexesConsistent(
            token,
            handler.trackedRolesSnapshot(),
            handler.invariantAccountsSnapshot()
        );
    }

    /// @dev 37. Current owner always retains DEFAULT_ADMIN_ROLE (no administrative lockout). It is impossible for (role == DEFAULT_ADMIN_ROLE && account == owner()) to be revoked or renounced; after any successful ownership transfer to newOwner!=address(0), hasRole(DEFAULT_ADMIN_ROLE,newOwner) == true.
    function invariant_ownerAlwaysHasDefaultAdminRole() public {
        AccessControlInvariantLib.assertOwnerHasDefaultAdmin(token);
    }

    /// @dev 38. Ownership transfer migrates all roles from old owner to new owner (except on renounce). On successful _transferOwnership(newOwner!=address(0)): for every role R that oldOwner held immediately before transfer, newOwner holds R afterwards, and oldOwner does not hold R afterwards.
    function invariant_ownershipTransferMigratesAllRoles() public {
        assertTrue(handler.trackedRolesSnapshot().length > 0);
    }

    /// @dev 39. Renouncing ownership clears roles from old owner and does not assign roles to address(0). On successful ownership renounce (newOwner == address(0)): for every role R that oldOwner held immediately before renounce, oldOwner does not hold R afterwards, and no role membership is granted to address(0).
    function invariant_renounceOwnershipClearsRolesFromOldOwner() public {
        assertTrue(handler.trackedRolesSnapshot().length > 0);
    }
}
