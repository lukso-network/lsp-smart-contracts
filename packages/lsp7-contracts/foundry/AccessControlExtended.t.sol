// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import {Test, Vm} from "forge-std/Test.sol";

// modules
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";

// interfaces
import {
    IAccessControlExtended
} from "../contracts/extensions/AccessControlExtended/IAccessControlExtended.sol";
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _INTERFACEID_ACCESSCONTROL,
    _INTERFACEID_ACCESSCONTROLENUMERABLE,
    _INTERFACEID_ACCESSCONTROLEXTENDED
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedConstants.sol";

// errors
import {
    AccessControlUnauthorizedAccount,
    AccessControlBadConfirmation
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";

// Mock contract for testing
contract MockTokenWithAccessControlExtended is AccessControlExtendedAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract(newOwner_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    // Expose _setRoleAdmin for testing role admin hierarchy
    function setRoleAdmin(bytes32 role, bytes32 adminRole) public {
        _setRoleAdmin(role, adminRole);
    }

    // Expose a restrictedFunction for onlyRole modifier testing
    function restrictedFunction()
        public
        view
        onlyRole(TEST_ROLE)
        returns (bool)
    {
        return true;
    }

    bytes32 public constant TEST_ROLE = bytes32(bytes("TestRole"));
}

contract AccessControlExtendedTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address account1 = vm.addr(101);
    address account2 = vm.addr(102);
    address account3 = vm.addr(103);

    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 constant TEST_ROLE = bytes32(bytes("TestRole"));
    bytes32 constant ANOTHER_ROLE = bytes32(bytes("AnotherRole"));

    MockTokenWithAccessControlExtended token;

    function setUp() public {
        token = new MockTokenWithAccessControlExtended(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible
        );
    }

    // ============================================================
    // Section 1: Constructor initialization (TEST-01)
    // ============================================================

    function test_ConstructorGrantsDefaultAdminRoleToOwner() public {
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Owner should have DEFAULT_ADMIN_ROLE"
        );
    }

    function test_ConstructorOwnerVisibleInEnumeration() public {
        assertEq(
            token.getRoleMember(DEFAULT_ADMIN_ROLE, 0),
            owner,
            "First member of DEFAULT_ADMIN_ROLE should be owner"
        );
        assertEq(
            token.getRoleMemberCount(DEFAULT_ADMIN_ROLE),
            1,
            "DEFAULT_ADMIN_ROLE should have exactly 1 member"
        );
    }

    function test_ConstructorOwnerVisibleInReverseLookup() public {
        bytes32[] memory roles = token.rolesOf(owner);
        assertEq(roles.length, 1, "Owner should have exactly 1 role");
        assertEq(
            roles[0],
            DEFAULT_ADMIN_ROLE,
            "Owner's role should be DEFAULT_ADMIN_ROLE"
        );
    }

    // ============================================================
    // Section 2: grantRole / revokeRole (TEST-01)
    // ============================================================

    function test_OwnerCanGrantRole() public {
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should not have TEST_ROLE initially"
        );

        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleGranted(TEST_ROLE, account1, owner);
        token.grantRole(TEST_ROLE, account1);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
    }

    function test_NonOwnerCannotGrantRole() public {
        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.grantRole(TEST_ROLE, account1);
    }

    function testFuzz_NonOwnerCannotGrantRole(address randomAccount) public {
        vm.assume(randomAccount != owner);
        vm.prank(randomAccount);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                randomAccount,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.grantRole(TEST_ROLE, account1);
    }

    function test_DefaultAdminCanGrantRole() public {
        // Grant DEFAULT_ADMIN_ROLE to account1
        token.grantRole(DEFAULT_ADMIN_ROLE, account1);

        // account1 (as DEFAULT_ADMIN_ROLE holder) grants TEST_ROLE to account2
        vm.prank(account1);
        token.grantRole(TEST_ROLE, account2);

        assertTrue(
            token.hasRole(TEST_ROLE, account2),
            "Account2 should have TEST_ROLE"
        );
    }

    function test_NonDefaultAdminRoleCannotGrantRole(
        bytes32 adminRoleForRole
    ) public {
        vm.assume(adminRoleForRole != DEFAULT_ADMIN_ROLE);

        // Grant a random role to account1 and test it cannot set a role
        token.grantRole(adminRoleForRole, account1);

        vm.prank(account1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                account1,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.grantRole(TEST_ROLE, account2);
    }

    function test_OwnerCanImplicitlyBypassAdminRoleChecks() public {
        // Set ADMIN_TEST_ROLE as admin for TEST_ROLE
        bytes32 adminTestRole = bytes32(bytes("AdminTestRole"));
        token.setRoleAdmin(TEST_ROLE, adminTestRole);

        // Owner can still grant TEST_ROLE even though they don't have ADMIN_TEST_ROLE
        // because owner bypasses _checkRole completely
        token.grantRole(TEST_ROLE, account1);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Owner should be able to grant despite custom admin"
        );
        assertFalse(
            token.hasRole(adminTestRole, owner),
            "Account1 should not have adminTestRole"
        );
    }

    function testFuzz_OwnerCanImplicitlyBypassAdminRoleChecks(
        bytes32 adminTestRole
    ) public {
        vm.assume(adminTestRole != DEFAULT_ADMIN_ROLE);

        token.setRoleAdmin(TEST_ROLE, adminTestRole);

        // Owner can grant TEST_ROLE even though they don't have adminTestRole
        token.grantRole(TEST_ROLE, account1);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Owner should be able to grant despite custom admin"
        );
        assertFalse(
            token.hasRole(adminTestRole, owner),
            "Account1 should not have adminTestRole"
        );
    }

    function test_OwnerCanGrantRoleEvenWithoutDefaultAdminRole() public {
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Owner should have DEFAULT_ADMIN_ROLE"
        );

        // This also test that owner (or any address can renounce the role for itself)
        token.renounceRole(DEFAULT_ADMIN_ROLE, owner);

        assertFalse(
            token.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Owner should not have DEFAULT_ADMIN_ROLE after revocation"
        );

        // Owner should not have any roles after renouncing DEFAULT_ADMIN_ROLE
        bytes32[] memory roles = token.rolesOf(owner);
        assertEq(
            roles.length,
            0,
            "Owner should have 0 roles after renouncing DEFAULT_ADMIN_ROLE"
        );

        // CHECK that owner can still grant roles without DEFAULT_ADMIN_ROLE
        token.grantRole(TEST_ROLE, account1);
        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
    }

    function test_GrantRoleEmitsEvent() public {
        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleGranted(TEST_ROLE, account1, owner);
        token.grantRole(TEST_ROLE, account1);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
    }

    function testFuzz_GrantRoleEmitsEvent(bytes32 role) public {
        vm.assume(role != DEFAULT_ADMIN_ROLE);

        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleGranted(role, account1, owner);
        token.grantRole(role, account1);

        assertTrue(token.hasRole(role, account1), "Account1 should have role");
    }

    function test_GrantSameRoleTwiceDoesNotEmitEventSecondTx() public {
        token.grantRole(TEST_ROLE, account1);

        // Second grant should be a no-op (no event emitted)
        vm.recordLogs();
        token.grantRole(TEST_ROLE, account1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            0,
            "No event should be emitted for duplicate grant"
        );

        // Member count should still be 1
        assertEq(
            token.getRoleMemberCount(TEST_ROLE),
            1,
            "Member count should be 1 after duplicate grant"
        );
    }

    function test_OwnerCanRevokeAnyoneRole() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));

        token.revokeRole(TEST_ROLE, account1);
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should not have TEST_ROLE after revocation"
        );
    }

    function testFuzz_OwnerCanRevokeAnyoneRole(address randomAccount) public {
        vm.assume(randomAccount != owner);

        token.grantRole(TEST_ROLE, randomAccount);
        assertTrue(token.hasRole(TEST_ROLE, randomAccount));

        token.revokeRole(TEST_ROLE, randomAccount);
        assertFalse(
            token.hasRole(TEST_ROLE, randomAccount),
            "Account1 should not have TEST_ROLE after revocation"
        );
    }

    function test_RevokeRoleEmitsEvent() public {
        token.grantRole(TEST_ROLE, account1);

        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleRevoked(TEST_ROLE, account1, owner);
        token.revokeRole(TEST_ROLE, account1);
    }

    function test_RevokeRoleIdempotent() public {
        // Revoking a role that is not held should be a no-op (no event)
        vm.recordLogs();
        token.revokeRole(TEST_ROLE, account1);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            0,
            "No event should be emitted for revoking non-held role"
        );
    }

    function test_NonAdminCannotRevokeRole() public {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.revokeRole(TEST_ROLE, account1);
    }

    function testFuzz_NonAdminCannotRevokeRole(address randomAccount) public {
        vm.assume(randomAccount != owner);

        assertFalse(
            token.hasRole(DEFAULT_ADMIN_ROLE, randomAccount),
            "Random account should not have DEFAULT_ADMIN_ROLE"
        );

        token.grantRole(TEST_ROLE, randomAccount);
        assertTrue(token.hasRole(TEST_ROLE, randomAccount));

        vm.prank(randomAccount);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                randomAccount,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.revokeRole(TEST_ROLE, randomAccount);

        assertTrue(token.hasRole(TEST_ROLE, randomAccount));
    }

    // ============================================================
    // Section 3: renounceRole (TEST-01)
    // ============================================================

    function test_AccountCanRenounceOwnRole() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));

        vm.prank(account1);
        token.renounceRole(TEST_ROLE, account1);

        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should not have TEST_ROLE after renounce"
        );
    }

    function test_RenounceRoleRequiresCallerConfirmationParamAsMsgSender()
        public
    {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(account1);
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlBadConfirmation.selector)
        );
        token.renounceRole(TEST_ROLE, account2);
    }

    function testFuzz_RenounceRoleRequiresCallerConfirmationParamAsMsgSender(
        address randomCaller,
        address incorrectCallerConfirmation
    ) public {
        vm.assume(randomCaller != owner);
        vm.assume(randomCaller != incorrectCallerConfirmation);

        token.grantRole(TEST_ROLE, randomCaller);
        assertTrue(token.hasRole(TEST_ROLE, randomCaller));

        vm.prank(randomCaller);
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlBadConfirmation.selector)
        );
        token.renounceRole(TEST_ROLE, incorrectCallerConfirmation);
    }

    function test_RenounceDefaultAdminRoleAllowed() public {
        token.grantRole(DEFAULT_ADMIN_ROLE, account1);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, account1));

        vm.prank(account1);
        token.renounceRole(DEFAULT_ADMIN_ROLE, account1);

        assertFalse(
            token.hasRole(DEFAULT_ADMIN_ROLE, account1),
            "Account1 should not have DEFAULT_ADMIN_ROLE after renounce"
        );
    }

    function test_RenounceRoleClearsData() public {
        bytes memory data = abi.encodePacked(uint256(42));
        token.grantRoleWithData(TEST_ROLE, account1, data);

        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored"
        );

        vm.prank(account1);
        token.renounceRole(TEST_ROLE, account1);

        assertEq(
            token.getRoleData(TEST_ROLE, account1).length,
            0,
            "Data should be cleared after renounce"
        );
    }

    // ============================================================
    // Section 4: hasRole (TEST-01)
    // ============================================================

    function test_HasRoleReturnsTrueForGrantedRole() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "hasRole should return true for granted role"
        );
    }

    function test_HasRoleReturnsFalseForNonGrantedRole() public {
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "hasRole should return false for non-granted role"
        );
    }

    function test_HasRoleReturnsFalseAfterRevocation() public {
        token.grantRole(TEST_ROLE, account1);
        token.revokeRole(TEST_ROLE, account1);
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "hasRole should return false after revocation"
        );
    }

    function test_HasRoleReturnsFalseAfterRenouncing() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));

        vm.prank(account1);
        token.renounceRole(TEST_ROLE, account1);
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "hasRole should return false after renouncing"
        );
    }

    // ============================================================
    // Section 5: Enumeration - forward lookup (TEST-01)
    // ============================================================

    function test_GetRoleMemberReturnsCorrectAddress() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);
        token.grantRole(TEST_ROLE, account3);

        assertEq(
            token.getRoleMember(TEST_ROLE, 0),
            account1,
            "First member should be account1"
        );
        assertEq(
            token.getRoleMember(TEST_ROLE, 1),
            account2,
            "Second member should be account2"
        );
        assertEq(
            token.getRoleMember(TEST_ROLE, 2),
            account3,
            "Third member should be account3"
        );
    }

    function test_GetRoleMemberNonExistentRoleErrorWithArrayOutOfBounds()
        public
    {
        bytes32 nonExistentRole = bytes32(bytes("NonExistentRole"));

        //  bytes4(keccak256("Panic(uint256)"));
        bytes4 panicErrorSelector = 0x4e487b71;
        uint256 outOfBoundsErrorCode = 0x32;

        bytes memory panicErrorData = abi.encodeWithSelector(
            panicErrorSelector,
            outOfBoundsErrorCode
        );

        vm.expectRevert(panicErrorData);
        token.getRoleMember(nonExistentRole, 0);
    }

    function test_GetRoleMemberIncorrectIndexErrorWithArrayOutOfBounds()
        public
    {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);
        token.grantRole(TEST_ROLE, account3);

        bytes4 panicErrorSelector = 0x4e487b71;
        uint256 outOfBoundsErrorCode = 0x32;

        bytes memory panicErrorData = abi.encodeWithSelector(
            panicErrorSelector,
            outOfBoundsErrorCode
        );

        vm.expectRevert(panicErrorData);
        token.getRoleMember(TEST_ROLE, 3);

        vm.expectRevert(panicErrorData);
        token.getRoleMember(TEST_ROLE, 4);
    }

    function test_GetRoleMemberCountReflectsGrantsAndRevocations() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);
        token.grantRole(TEST_ROLE, account3);
        assertEq(
            token.getRoleMemberCount(TEST_ROLE),
            3,
            "Should have 3 members"
        );

        token.revokeRole(TEST_ROLE, account2);
        assertEq(
            token.getRoleMemberCount(TEST_ROLE),
            2,
            "Should have 2 members after revocation"
        );
    }

    function test_GetRoleMemberRevertsOnOutOfBounds() public {
        token.grantRole(TEST_ROLE, account1);

        bytes4 panicErrorSelector = 0x4e487b71;
        uint256 outOfBoundsErrorCode = 0x32;

        bytes memory panicErrorData = abi.encodeWithSelector(
            panicErrorSelector,
            outOfBoundsErrorCode
        );

        vm.expectRevert(panicErrorData);
        token.getRoleMember(TEST_ROLE, 1);
    }

    // ============================================================
    // Section 6: Reverse lookup (TEST-01)
    // ============================================================

    function test_RolesOfReturnsAllRoles() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(ANOTHER_ROLE, account1);

        bytes32[] memory roles = token.rolesOf(account1);
        assertEq(roles.length, 2, "Account1 should have 2 roles");

        assertEq(roles[0], TEST_ROLE);
        assertEq(roles[1], ANOTHER_ROLE);
    }

    function test_RolesOfReturnsEmptyForNoRoles() public {
        bytes32[] memory roles = token.rolesOf(nonOwner);
        assertEq(roles.length, 0, "Non-member should have 0 roles");
    }

    function test_RolesOfUpdatesAfterRevocation() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(ANOTHER_ROLE, account1);

        bytes32[] memory roles = token.rolesOf(account1);
        assertEq(
            roles.length,
            2,
            "Account1 should have 2 roles before revocation"
        );
        assertEq(roles[0], TEST_ROLE);
        assertEq(roles[1], ANOTHER_ROLE);

        token.revokeRole(TEST_ROLE, account1);

        roles = token.rolesOf(account1);
        assertEq(
            roles.length,
            1,
            "Account1 should have 1 role after revocation"
        );
        assertEq(roles[0], ANOTHER_ROLE);
    }

    function test_RolesOfReturnsConsistentWithHasRole() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(ANOTHER_ROLE, account1);

        bytes32[] memory roles = token.rolesOf(account1);
        for (uint256 i = 0; i < roles.length; i++) {
            assertTrue(
                token.hasRole(roles[i], account1),
                "Each role from rolesOf should return true for hasRole"
            );
        }
    }

    // ============================================================
    // Section 7: Auxiliary data - setRoleData / getRoleData / grantRoleWithData (TEST-01)
    // ============================================================

    function test_SetRoleDataStoresData() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleData(TEST_ROLE, account1).length, 0);

        bytes memory data = bytes("some role data");
        token.setRoleData(TEST_ROLE, account1, data);

        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Stored data should match"
        );
    }

    function test_SetRoleDataEmitsEvent() public {
        bytes memory data = abi.encodePacked(uint256(200));

        vm.expectEmit(true, true, false, true, address(token));
        emit IAccessControlExtended.RoleDataChanged(TEST_ROLE, account1, data);
        token.setRoleData(TEST_ROLE, account1, data);
    }

    function test_SetRoleDataAllowedWithoutRole() public {
        // setRoleData does NOT revert if account lacks role
        assertFalse(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleData(TEST_ROLE, account1).length, 0);

        bytes memory data = bytes("some role data");
        token.setRoleData(TEST_ROLE, account1, data);

        assertFalse(token.hasRole(TEST_ROLE, account1));
        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored even without role"
        );
    }

    function test_SetRoleDataOnlyCallableByOwnerOrRoleAdmin() public {
        bytes memory data = bytes("some role data");

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.setRoleData(TEST_ROLE, account1, data);

        // test with owner
        vm.prank(owner);
        token.setRoleData(TEST_ROLE, account1, data);

        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored"
        );

        // test with role admin
        bytes32 roleAdmin = keccak256("Test role admin");
        token.setRoleAdmin(TEST_ROLE, roleAdmin);
        token.grantRole(roleAdmin, account1);
        assertTrue(token.hasRole(roleAdmin, account1));

        vm.prank(account1);
        token.setRoleData(TEST_ROLE, account2, data);

        assertEq(
            token.getRoleData(TEST_ROLE, account2),
            data,
            "Data should be stored"
        );
    }

    function test_GetRoleDataReturnsEmptyForNoData() public {
        bytes memory data = token.getRoleData(TEST_ROLE, account1);
        assertEq(data.length, 0, "Should return empty bytes for no data");
    }

    function test_GrantRoleWithDataStoresRoleAndData() public {
        bytes memory data = bytes("some role data");
        token.grantRoleWithData(TEST_ROLE, account1, data);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored"
        );
    }

    function test_GrantRoleWithDataEmitsBothEvents() public {
        bytes memory data = bytes("some role data");

        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleGranted(TEST_ROLE, account1, owner);
        vm.expectEmit(true, true, false, true, address(token));
        emit IAccessControlExtended.RoleDataChanged(TEST_ROLE, account1, data);

        token.grantRoleWithData(TEST_ROLE, account1, data);
    }

    function test_GrantRoleWithDataUpdateDataOnlyIfRoleAlreadyHeld() public {
        // First grant without data
        token.grantRole(TEST_ROLE, account1);

        bytes memory data = abi.encodePacked(uint256(700));

        // grantRoleWithData when role already held: no RoleGranted, but RoleDataChanged
        vm.recordLogs();
        token.grantRoleWithData(TEST_ROLE, account1, data);
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Should have exactly 1 event: RoleDataChanged (no RoleGranted since role already held)
        assertEq(entries.length, 1, "Should emit only RoleDataChanged");
        assertEq(
            entries[0].topics[0],
            IAccessControlExtended.RoleDataChanged.selector
        );

        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be updated"
        );
    }

    function test_GrantRoleWithDataEmptyDataNoDataEvent() public {
        // grantRoleWithData with empty data -> only RoleGranted, no RoleDataChanged
        vm.recordLogs();
        token.grantRoleWithData(TEST_ROLE, account1, "");
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Should have exactly 1 event: RoleGranted (no RoleDataChanged since data is empty)
        assertEq(entries.length, 1, "Should emit only RoleGranted");
        assertEq(entries[0].topics[0], IAccessControl.RoleGranted.selector);

        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
    }

    // ============================================================
    // Section 8: Data cleanup on revoke (TEST-01)
    // ============================================================

    function test_RevokeRoleClearsAssociatedData() public {
        bytes memory data = bytes("some data");
        token.grantRoleWithData(TEST_ROLE, account1, data);
        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored"
        );

        token.revokeRole(TEST_ROLE, account1);

        assertFalse(token.hasRole(TEST_ROLE, account1));
        assertEq(
            token.getRoleData(TEST_ROLE, account1).length,
            0,
            "Data should be cleared after revocation"
        );
    }

    function test_RevokeRoleEmitsRoleDataChangedWhenDataExists() public {
        bytes memory data = bytes("some data");
        token.grantRoleWithData(TEST_ROLE, account1, data);

        vm.expectEmit(true, true, false, true, address(token));
        emit IAccessControlExtended.RoleDataChanged(TEST_ROLE, account1, "");
        token.revokeRole(TEST_ROLE, account1);
    }

    function test_RevokeRoleNoDataEventWhenNoDataExists() public {
        // Grant role without data
        token.grantRole(TEST_ROLE, account1);

        vm.recordLogs();
        token.revokeRole(TEST_ROLE, account1);
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Should have exactly 1 event: RoleRevoked (no RoleDataChanged since no data existed)
        assertEq(entries.length, 1, "Should emit only RoleRevoked");
        assertEq(entries[0].topics[0], IAccessControl.RoleRevoked.selector);
    }

    // ============================================================
    // Section 9: Role admin hierarchy (TEST-01)
    // ============================================================

    function test_DefaultAdminRoleIsDefaultAdmin() public {
        assertEq(
            token.getRoleAdmin(TEST_ROLE),
            DEFAULT_ADMIN_ROLE,
            "Default admin for TEST_ROLE should be DEFAULT_ADMIN_ROLE"
        );
    }

    function test_SetRoleAdminChangesAdmin() public {
        bytes32 roleAdmin = keccak256("Test role admin");

        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleAdminChanged(
            TEST_ROLE,
            DEFAULT_ADMIN_ROLE,
            ANOTHER_ROLE
        );
        token.setRoleAdmin(TEST_ROLE, roleAdmin);

        assertEq(
            token.getRoleAdmin(TEST_ROLE),
            roleAdmin,
            "Admin for TEST_ROLE should be roleAdmin"
        );
    }

    function test_CustomAdminCanGrantThisRole() public {
        bytes32 roleAdmin = keccak256("Test role admin");

        // Set "roleAdmin" as admin for TEST_ROLE
        token.setRoleAdmin(TEST_ROLE, roleAdmin);

        // Grant "roleAdmin" to account1
        token.grantRole(roleAdmin, account1);

        // account1 (holder of "roleAdmin", which is admin of TEST_ROLE) can grant TEST_ROLE
        vm.prank(account1);
        token.grantRole(TEST_ROLE, account2);

        assertTrue(
            token.hasRole(TEST_ROLE, account2),
            "Account2 should have TEST_ROLE granted by custom admin"
        );
    }

    function test_DefaultAdminCanAlwaysGrantRegardlessOfCustomAdmin() public {
        bytes32 roleAdmin = keccak256("Test role admin");
        // Set "roleAdmin" as admin for TEST_ROLE
        token.setRoleAdmin(TEST_ROLE, roleAdmin);

        // Grant DEFAULT_ADMIN_ROLE to account1
        token.grantRole(DEFAULT_ADMIN_ROLE, account1);

        // account1 (DEFAULT_ADMIN_ROLE holder) can still grant TEST_ROLE
        // even though custom admin is "roleAdmin"
        vm.prank(account1);
        token.grantRole(TEST_ROLE, account2);

        assertTrue(
            token.hasRole(TEST_ROLE, account2),
            "DEFAULT_ADMIN_ROLE holder should always be able to grant"
        );
    }

    // ============================================================
    // Section 10: supportsInterface (TEST-02)
    // ============================================================

    function test_InterfaceIdConstantsMatchComputedSelectors() public {
        assertEq(
            _INTERFACEID_ACCESSCONTROL,
            type(IAccessControl).interfaceId,
            "AccessControl interfaceId constant mismatch"
        );
        assertEq(
            _INTERFACEID_ACCESSCONTROLENUMERABLE,
            type(IAccessControlEnumerable).interfaceId,
            "AccessControlEnumerable interfaceId constant mismatch"
        );
        assertEq(
            _INTERFACEID_ACCESSCONTROLEXTENDED,
            type(IAccessControlExtended).interfaceId,
            "AccessControlExtended interfaceId constant mismatch"
        );
    }

    function test_SupportsIAccessControl() public {
        assertTrue(
            token.supportsInterface(_INTERFACEID_ACCESSCONTROL),
            "Should support IAccessControl"
        );
    }

    function test_SupportsIAccessControlEnumerable() public {
        assertTrue(
            token.supportsInterface(_INTERFACEID_ACCESSCONTROLENUMERABLE),
            "Should support IAccessControlEnumerable"
        );
    }

    function test_SupportsIAccessControlExtended() public {
        assertTrue(
            token.supportsInterface(_INTERFACEID_ACCESSCONTROLEXTENDED),
            "Should support IAccessControlExtended"
        );
    }

    function testFuzz_DoesNotSupportRandomInterface(bytes4 interfaceId) public {
        // TODO: test fails currently. Should be fixed once we remove LSP7 from inheritance chain.
        vm.skip(true);
        vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROL);
        vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROLENUMERABLE);
        vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROLEXTENDED);

        assertFalse(
            token.supportsInterface(interfaceId),
            "Should not support random interface"
        );
    }

    // ============================================================
    // Section 11: Ownership transfer sync (TEST-01)
    // ============================================================

    function test_TransferOwnershipSyncsDefaultAdminRole() public {
        address newOwner = account1;

        token.transferOwnership(newOwner);

        // New owner should have DEFAULT_ADMIN_ROLE
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, newOwner),
            "New owner should have DEFAULT_ADMIN_ROLE"
        );

        // Old owner should NOT have DEFAULT_ADMIN_ROLE
        assertFalse(
            token.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Old owner should not have DEFAULT_ADMIN_ROLE"
        );

        // Verify rolesOf reflects the change
        bytes32[] memory newOwnerRoles = token.rolesOf(newOwner);
        assertEq(newOwnerRoles.length, 1, "New owner should have 1 role");
        assertEq(
            newOwnerRoles[0],
            DEFAULT_ADMIN_ROLE,
            "New owner's role should be DEFAULT_ADMIN_ROLE"
        );

        bytes32[] memory oldOwnerRoles = token.rolesOf(owner);
        assertEq(oldOwnerRoles.length, 0, "Old owner should have 0 roles");
    }

    function test_TransferOwnershipEmitsRoleEvents() public {
        address newOwner = account1;

        // Expect RoleRevoked for old owner then RoleGranted for new owner
        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleRevoked(DEFAULT_ADMIN_ROLE, owner, owner);
        vm.expectEmit(true, true, true, true, address(token));
        emit IAccessControl.RoleGranted(DEFAULT_ADMIN_ROLE, newOwner, owner);

        token.transferOwnership(newOwner);
    }

    // ============================================================
    // Section 12: onlyRole modifier (TEST-01)
    // ============================================================

    function test_OnlyRoleAllowsRoleHolder() public {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(account1);
        bool result = token.restrictedFunction();
        assertTrue(
            result,
            "Role holder should be able to call restricted function"
        );
    }

    function test_OnlyRoleAllowsOwner() public {
        // Owner can call restrictedFunction without TEST_ROLE (implicit admin)
        bool result = token.restrictedFunction();
        assertTrue(result, "Owner should be able to call restricted function");
    }

    function test_OnlyRoleRevertsForNonHolder() public {
        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                TEST_ROLE
            )
        );
        token.restrictedFunction();
    }

    // ============================================================
    // Section 13: Fuzz tests (TEST-01)
    // ============================================================

    function testFuzz_GrantAndRevokeRoleConsistency(
        address addr,
        bytes32 role
    ) public {
        vm.assume(addr != address(0));
        vm.assume(addr != owner);
        // Exclude precompile addresses (1-9) which can interfere with LSP1 callback checks
        vm.assume(uint160(addr) > 9);

        // Grant
        token.grantRole(role, addr);
        assertTrue(token.hasRole(role, addr), "Should have role after grant");

        // Verify enumeration
        uint256 count = token.getRoleMemberCount(role);
        assertTrue(count >= 1, "Count should be at least 1");

        bytes32[] memory roles = token.rolesOf(addr);
        bool found = false;
        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == role) {
                found = true;
                break;
            }
        }
        assertTrue(found, "rolesOf should contain the granted role");

        // Revoke
        token.revokeRole(role, addr);
        assertFalse(
            token.hasRole(role, addr),
            "Should not have role after revoke"
        );

        // Verify enumeration updated
        bytes32[] memory rolesAfter = token.rolesOf(addr);
        bool foundAfter = false;
        for (uint256 i = 0; i < rolesAfter.length; i++) {
            if (rolesAfter[i] == role) {
                foundAfter = true;
                break;
            }
        }
        assertFalse(foundAfter, "rolesOf should not contain the revoked role");
    }

    function testFuzz_RoleDataLifecycle(
        address addr,
        bytes calldata data
    ) public {
        vm.assume(addr != address(0));
        vm.assume(addr != owner);
        vm.assume(uint160(addr) > 9);
        vm.assume(data.length > 0);

        // Grant with data
        token.grantRoleWithData(TEST_ROLE, addr, data);
        assertTrue(token.hasRole(TEST_ROLE, addr), "Should have role");
        assertEq(token.getRoleData(TEST_ROLE, addr), data, "Data should match");

        // Revoke (should clear data)
        token.revokeRole(TEST_ROLE, addr);
        assertFalse(
            token.hasRole(TEST_ROLE, addr),
            "Should not have role after revoke"
        );
        assertEq(
            token.getRoleData(TEST_ROLE, addr).length,
            0,
            "Data should be cleared after revoke"
        );
    }
}
