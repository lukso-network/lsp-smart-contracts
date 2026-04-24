// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test, Vm} from "forge-std/Test.sol";

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

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
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";
import {
    _INTERFACEID_ACCESSCONTROL,
    _INTERFACEID_ACCESSCONTROLENUMERABLE,
    _INTERFACEID_ACCESSCONTROLEXTENDED
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedConstants.sol";

// errors
import {
    AccessControlUnauthorizedAccount,
    AccessControlBadConfirmation,
    AccessControlCannotSetAdminForDefaultAdminRole
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";

contract MockLSP8WithAccessControlExtended is
    LSP8IdentifiableDigitalAsset,
    AccessControlExtendedAbstract
{
    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 public constant TEST_ROLE = bytes32(bytes("TestRole"));

    constructor(
        address newOwner_
    )
        LSP8IdentifiableDigitalAsset(
            "Test NFT",
            "TNFT",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
        )
        AccessControlExtendedAbstract()
    {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP8IdentifiableDigitalAsset, AccessControlExtendedAbstract)
        returns (bool)
    {
        return
            LSP8IdentifiableDigitalAsset.supportsInterface(interfaceId) ||
            AccessControlExtendedAbstract.supportsInterface(interfaceId);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        AccessControlExtendedAbstract._transferOwnership(newOwner);
    }

    function restrictedFunction()
        public
        view
        onlyRole(TEST_ROLE)
        returns (bool)
    {
        return true;
    }
}

contract AccessControlExtendedTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 constant TEST_ROLE = bytes32(bytes("TestRole"));

    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 constant ADMIN_ROLE = bytes32(bytes("AdminRole"));

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address account1 = vm.addr(101);
    address account2 = vm.addr(102);
    address account3 = vm.addr(103);

    bytes32 constant MINTER_ROLE = keccak256("MINTER");
    bytes32 constant BURNER_ROLE = keccak256("BURNER");

    MockLSP8WithAccessControlExtended token;

    function setUp() public {
        token = new MockLSP8WithAccessControlExtended(owner);
    }

    function test_ConstructorGrantsDefaultAdminRoleToOwner() public {
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertEq(token.getRoleMember(DEFAULT_ADMIN_ROLE, 0), owner);
        assertEq(token.getRoleMemberCount(DEFAULT_ADMIN_ROLE), 1);
    }

    function test_ConstructorGrantsDefaultAdminRoleToInitialOwnerNotDeployer()
        public
    {
        address initialOwner = vm.addr(200);
        MockLSP8WithAccessControlExtended tokenWithExternalOwner = new MockLSP8WithAccessControlExtended(
                initialOwner
            );

        assertTrue(
            tokenWithExternalOwner.hasRole(DEFAULT_ADMIN_ROLE, initialOwner)
        );
        assertEq(
            tokenWithExternalOwner.getRoleMember(DEFAULT_ADMIN_ROLE, 0),
            initialOwner
        );
        assertEq(
            tokenWithExternalOwner.getRoleMemberCount(DEFAULT_ADMIN_ROLE),
            1
        );

        // CHECK the deployer is getting the DEFAULT_ADMIN_ROLE
        assertFalse(
            tokenWithExternalOwner.hasRole(DEFAULT_ADMIN_ROLE, address(this))
        );
    }

    function test_GrantRoleAndEnumerate() public {
        token.grantRole(TEST_ROLE, account1);

        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleMemberCount(TEST_ROLE), 1);
        assertEq(token.getRoleMember(TEST_ROLE, 0), account1);
        assertEq(token.rolesOf(account1).length, 1);
    }

    function test_CustomAdminRoleIsEnforced() public {
        token.setRoleAdmin(TEST_ROLE, ADMIN_ROLE);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                owner,
                ADMIN_ROLE
            )
        );
        token.grantRole(TEST_ROLE, account1);

        token.grantRole(ADMIN_ROLE, owner);
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));
    }

    function test_NonDefaultAdminCannotSetRoleAdmin() public {
        vm.prank(account1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                account1,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.setRoleAdmin(TEST_ROLE, ADMIN_ROLE);
    }

    function test_GrantRoleStoresRole() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));
    }

    function test_RevokeRoleClearsRole() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(token.hasRole(TEST_ROLE, account1));

        token.revokeRole(TEST_ROLE, account1);
        assertFalse(token.hasRole(TEST_ROLE, account1));
    }

    function test_RenounceRoleRequiresConfirmation() public {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(account1);
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlBadConfirmation.selector)
        );
        token.renounceRole(TEST_ROLE, account2);
    }

    function test_TransferOwnershipSyncsDefaultAdminRole() public {
        token.transferOwnership(account1);

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, account1));
        assertEq(token.rolesOf(owner).length, 0);
        assertEq(token.rolesOf(account1).length, 1);
    }

    function test_SupportsAccessControlInterfaces() public {
        assertTrue(token.supportsInterface(_INTERFACEID_ACCESSCONTROL));
        assertTrue(
            token.supportsInterface(_INTERFACEID_ACCESSCONTROLENUMERABLE)
        );
        assertTrue(token.supportsInterface(_INTERFACEID_ACCESSCONTROLEXTENDED));
    }

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

    function test_GetRoleMembersReturnsAllMembers() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);

        address[] memory members = token.getRoleMembers(TEST_ROLE);

        assertEq(members.length, 2);
        assertEq(members[0], account1);
        assertEq(members[1], account2);
    }

    function test_TransferOwnershipTransfersAllRoles() public {
        bytes32 minterRole = keccak256("MINTER_ROLE");
        bytes32 burnerRole = keccak256("BURNER_ROLE");

        token.grantRole(minterRole, owner);
        token.grantRole(burnerRole, owner);

        token.transferOwnership(account1);

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(token.hasRole(minterRole, owner));
        assertFalse(token.hasRole(burnerRole, owner));
        assertEq(token.rolesOf(owner).length, 0);

        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, account1));
        assertTrue(token.hasRole(minterRole, account1));
        assertTrue(token.hasRole(burnerRole, account1));
        assertEq(token.rolesOf(account1).length, 3);
    }

    function test_RenounceOwnershipRevokesAllRoles() public {
        bytes32 minterRole = keccak256("MINTER_ROLE");

        token.grantRole(minterRole, owner);
        token.renounceOwnership();

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(token.hasRole(minterRole, owner));
        assertEq(token.rolesOf(owner).length, 0);
    }

    function test_NonAdminCannotGrantRole() public {
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

    function testFuzz_DefaultAdminCanSetRoleAdmin(
        bytes32 role,
        bytes32 roleAdmin
    ) public {
        vm.assume(role != DEFAULT_ADMIN_ROLE);

        token.setRoleAdmin(role, roleAdmin);
        assertEq(token.getRoleAdmin(role), roleAdmin);
    }

    function testFuzz_NonDefaultAdminCannotSetRoleAdmin(
        address randomCaller,
        bytes32 role,
        bytes32 roleAdmin
    ) public {
        vm.assume(randomCaller != owner);

        vm.prank(randomCaller);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                randomCaller,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.setRoleAdmin(role, roleAdmin);
    }

    function testFuzz_OwnerCannotChangeAdminRoleForDefaultAdminRole(
        bytes32 newAdminRole
    ) public {
        assertEq(token.getRoleAdmin(DEFAULT_ADMIN_ROLE), DEFAULT_ADMIN_ROLE);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlCannotSetAdminForDefaultAdminRole.selector
            )
        );
        token.setRoleAdmin(DEFAULT_ADMIN_ROLE, newAdminRole);

        assertEq(token.getRoleAdmin(DEFAULT_ADMIN_ROLE), DEFAULT_ADMIN_ROLE);
    }

    function testFuzz_DefaultAdminCannotChangeAdminRoleForDefaultAdminRole(
        address addressWithDefaultAdminRole,
        bytes32 newAdminRole
    ) public {
        vm.assume(addressWithDefaultAdminRole != owner);
        token.grantRole(DEFAULT_ADMIN_ROLE, addressWithDefaultAdminRole);
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, addressWithDefaultAdminRole)
        );

        vm.prank(addressWithDefaultAdminRole);
        assertEq(token.getRoleAdmin(DEFAULT_ADMIN_ROLE), DEFAULT_ADMIN_ROLE);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlCannotSetAdminForDefaultAdminRole.selector
            )
        );
        vm.prank(addressWithDefaultAdminRole);
        token.setRoleAdmin(DEFAULT_ADMIN_ROLE, newAdminRole);

        assertEq(token.getRoleAdmin(DEFAULT_ADMIN_ROLE), DEFAULT_ADMIN_ROLE);
    }

    function test_TransferOwnershipDoesNotAffectOtherRoleHolders() public {
        token.grantRole(MINTER_ROLE, owner);
        token.grantRole(MINTER_ROLE, account2);

        address newOwner = account1;
        token.transferOwnership(newOwner);

        assertTrue(token.hasRole(MINTER_ROLE, account2));
        assertTrue(token.hasRole(MINTER_ROLE, newOwner));
        assertFalse(token.hasRole(MINTER_ROLE, owner));
    }

    function test_TransferOwnershipTransfersOldOwnerRoles() public {
        token.grantRole(MINTER_ROLE, owner);

        assertTrue(token.hasRole(MINTER_ROLE, owner));

        bytes32[] memory ownerRoles = token.rolesOf(owner);
        assertEq(ownerRoles.length, 2);
        assertEq(ownerRoles[0], DEFAULT_ADMIN_ROLE);
        assertEq(ownerRoles[1], MINTER_ROLE);

        address newOwner = account1;
        token.transferOwnership(newOwner);

        bytes32[] memory rolesAfter = token.rolesOf(owner);
        assertEq(rolesAfter.length, 0);

        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, newOwner));
        assertTrue(token.hasRole(MINTER_ROLE, newOwner));

        bytes32[] memory newOwnerRoles = token.rolesOf(newOwner);
        assertEq(newOwnerRoles.length, 2);
        assertEq(newOwnerRoles[0], DEFAULT_ADMIN_ROLE);
        assertEq(newOwnerRoles[1], MINTER_ROLE);
    }

    function test_TransferOwnershipEmitsAllRoleEvents() public {
        token.grantRole(MINTER_ROLE, owner);

        address newOwner = account1;

        vm.recordLogs();
        token.transferOwnership(newOwner);
        Vm.Log[] memory entries = vm.getRecordedLogs();

        assertEq(entries.length, 5);

        bytes32 revokedSel = IAccessControl.RoleRevoked.selector;
        bytes32 grantedSel = IAccessControl.RoleGranted.selector;
        bytes32 transferredSel = Ownable.OwnershipTransferred.selector;

        uint256 revokedCount;
        uint256 grantedCount;
        bool ownershipTransferredFound;

        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == revokedSel) {
                assertEq(
                    entries[i].topics[2],
                    bytes32(uint256(uint160(owner)))
                );
                revokedCount++;
            } else if (entries[i].topics[0] == grantedSel) {
                assertEq(
                    entries[i].topics[2],
                    bytes32(uint256(uint160(newOwner)))
                );
                grantedCount++;
            } else if (entries[i].topics[0] == transferredSel) {
                assertEq(
                    entries[i].topics[1],
                    bytes32(uint256(uint160(owner)))
                );
                assertEq(
                    entries[i].topics[2],
                    bytes32(uint256(uint160(newOwner)))
                );
                ownershipTransferredFound = true;
            }
        }

        assertEq(revokedCount, 2);
        assertEq(grantedCount, 2);
        assertTrue(ownershipTransferredFound);
    }

    function test_TransferOwnershipNewOwnerAlreadyHasSomeRoles() public {
        token.grantRole(MINTER_ROLE, owner);
        token.grantRole(BURNER_ROLE, owner);
        token.grantRole(BURNER_ROLE, account1);

        address newOwner = account1;
        token.transferOwnership(newOwner);

        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, newOwner));
        assertTrue(token.hasRole(MINTER_ROLE, newOwner));
        assertTrue(token.hasRole(BURNER_ROLE, newOwner));
        assertEq(token.getRoleMemberCount(BURNER_ROLE), 1);
    }

    function test_OnlyRoleAllowsRoleHolder() public {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(account1);
        bool result = token.restrictedFunction();
        assertTrue(result);
    }

    function test_OnlyRoleDoesNotBypassOwner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                owner,
                TEST_ROLE
            )
        );
        token.restrictedFunction();
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

    function test_GetRoleMembersReturnsEmptyForNoMembers() public {
        bytes32 unknownRole = keccak256("UNKNOWN");
        address[] memory members = token.getRoleMembers(unknownRole);
        assertEq(members.length, 0);
    }

    function test_GetRoleMembersReturnsSingleMember() public {
        address[] memory members = token.getRoleMembers(DEFAULT_ADMIN_ROLE);
        assertEq(members.length, 1);
        assertEq(members[0], owner);
    }

    function test_GetRoleMembersReturnsMultipleMembers() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);
        token.grantRole(TEST_ROLE, account3);

        address[] memory members = token.getRoleMembers(TEST_ROLE);
        assertEq(members.length, 3);

        bool found1;
        bool found2;
        bool found3;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == account1) found1 = true;
            if (members[i] == account2) found2 = true;
            if (members[i] == account3) found3 = true;
        }
        assertTrue(found1);
        assertTrue(found2);
        assertTrue(found3);
    }

    function test_GetRoleMembersUpdatesAfterRevocation() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);

        assertEq(token.getRoleMembers(TEST_ROLE).length, 2);

        token.revokeRole(TEST_ROLE, account1);

        address[] memory members = token.getRoleMembers(TEST_ROLE);
        assertEq(members.length, 1);
        assertEq(members[0], account2);
    }

    function test_GetRoleMembersConsistentWithGetRoleMemberCount() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);

        address[] memory members = token.getRoleMembers(TEST_ROLE);
        uint256 count = token.getRoleMemberCount(TEST_ROLE);

        assertEq(members.length, count);
    }

    function test_GetRoleMembersConsistentWithGetRoleMember() public {
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);
        token.grantRole(TEST_ROLE, account3);

        address[] memory allMembers = token.getRoleMembers(TEST_ROLE);

        for (uint256 i = 0; i < allMembers.length; i++) {
            assertEq(allMembers[i], token.getRoleMember(TEST_ROLE, i));
        }
    }

    function testFuzz_GetRoleMembersAfterGrantAndRevoke(
        address addr1,
        address addr2
    ) public {
        vm.assume(addr1 != address(0) && addr2 != address(0));
        vm.assume(addr1 != addr2);
        vm.assume(addr1 != owner && addr2 != owner);
        vm.assume(uint160(addr1) > 9 && uint160(addr2) > 9);

        token.grantRole(TEST_ROLE, addr1);
        token.grantRole(TEST_ROLE, addr2);

        address[] memory membersAfterGrant = token.getRoleMembers(TEST_ROLE);
        assertEq(membersAfterGrant.length, 2);

        token.revokeRole(TEST_ROLE, addr1);

        address[] memory membersAfterRevoke = token.getRoleMembers(TEST_ROLE);
        assertEq(membersAfterRevoke.length, 1);
        assertEq(membersAfterRevoke[0], addr2);
    }
}
