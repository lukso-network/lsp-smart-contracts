// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

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
    AccessControlBadConfirmation
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";

contract MockLSP8WithAccessControlExtended is
    LSP8IdentifiableDigitalAsset,
    AccessControlExtendedAbstract
{
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
        AccessControlExtendedAbstract(newOwner_)
    {}

    function setRoleAdmin(bytes32 role, bytes32 adminRole) public {
        _setRoleAdmin(role, adminRole);
    }

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
}

contract AccessControlExtendedTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 constant TEST_ROLE = bytes32(bytes("TestRole"));
    bytes32 constant ADMIN_ROLE = bytes32(bytes("AdminRole"));

    address owner = address(this);
    address account1 = vm.addr(101);
    address account2 = vm.addr(102);

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

    function test_GrantRoleWithDataStoresData() public {
        bytes memory data = abi.encodePacked(uint256(42));

        token.grantRoleWithData(TEST_ROLE, account1, data);

        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleData(TEST_ROLE, account1), data);
    }

    function test_RevokeRoleClearsData() public {
        token.grantRoleWithData(TEST_ROLE, account1, bytes("hello"));

        token.revokeRole(TEST_ROLE, account1);

        assertFalse(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleData(TEST_ROLE, account1).length, 0);
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
        assertEq(_INTERFACEID_ACCESSCONTROL, type(IAccessControl).interfaceId);
        assertEq(
            _INTERFACEID_ACCESSCONTROLENUMERABLE,
            type(IAccessControlEnumerable).interfaceId
        );
        assertEq(
            _INTERFACEID_ACCESSCONTROLEXTENDED,
            type(IAccessControlExtended).interfaceId
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
        token.grantRoleWithData(burnerRole, owner, hex"cafe");

        token.transferOwnership(account1);

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(token.hasRole(minterRole, owner));
        assertFalse(token.hasRole(burnerRole, owner));
        assertEq(token.rolesOf(owner).length, 0);
        assertEq(token.getRoleData(burnerRole, owner).length, 0);

        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, account1));
        assertTrue(token.hasRole(minterRole, account1));
        assertTrue(token.hasRole(burnerRole, account1));
        assertEq(token.rolesOf(account1).length, 3);
        assertEq(token.getRoleData(burnerRole, account1), hex"cafe");
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
}
