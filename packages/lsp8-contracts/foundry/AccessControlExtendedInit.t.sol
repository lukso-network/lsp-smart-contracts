// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

// modules
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    AccessControlExtendedInitAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../contracts/LSP8IdentifiableDigitalAssetInitAbstract.sol";

// proxy
import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";

contract MockAccessControlExtendedInit is
    LSP8IdentifiableDigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 public constant TEST_ROLE = bytes32(bytes("TestRole"));

    function initialize(address newOwner_) external initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            "Test NFT",
            "TNFT",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
        );
        __AccessControlExtended_init();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8IdentifiableDigitalAssetInitAbstract,
            AccessControlExtendedInitAbstract
        )
        returns (bool)
    {
        return
            LSP8IdentifiableDigitalAssetInitAbstract.supportsInterface(
                interfaceId
            ) ||
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        AccessControlExtendedInitAbstract._transferOwnership(newOwner);
    }
}

contract AccessControlExtendedInitTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 constant TEST_ROLE = bytes32(bytes("TestRole"));

    // casting to 'bytes32' is safe because role name is less than 32 bytes / characters
    // forge-lint: disable-next-line(unsafe-typecast)
    bytes32 constant EXTRA_ROLE = bytes32(bytes("ExtraRole"));

    address owner = address(this);
    address account1 = vm.addr(101);

    MockAccessControlExtendedInit implementation;
    MockAccessControlExtendedInit token;

    function setUp() public {
        implementation = new MockAccessControlExtendedInit();

        bytes memory initializeCalldata = abi.encodeCall(
            MockAccessControlExtendedInit.initialize,
            (owner)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initializeCalldata
        );
        token = MockAccessControlExtendedInit(payable(address(proxy)));
    }

    function test_InitializeSetsOwnerAndDefaultAdminRole() public {
        assertEq(token.owner(), owner);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
    }

    function test_GrantRoleWorksThroughProxy() public {
        token.grantRole(TEST_ROLE, account1);

        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(token.getRoleMemberCount(TEST_ROLE), 1);
        assertEq(token.rolesOf(account1).length, 1);
    }

    function test_GetRoleMembersWorksThroughProxy() public {
        token.grantRole(TEST_ROLE, account1);

        address[] memory members = token.getRoleMembers(TEST_ROLE);

        assertEq(members.length, 1);
        assertEq(members[0], account1);
    }

    function test_DefaultAdminCanSetRoleAdminThroughProxy() public {
        bytes32 roleAdmin = keccak256("ROLE_ADMIN");
        token.setRoleAdmin(TEST_ROLE, roleAdmin);
        assertEq(token.getRoleAdmin(TEST_ROLE), roleAdmin);
    }

    function test_NonDefaultAdminCannotSetRoleAdminThroughProxy() public {
        bytes32 roleAdmin = keccak256("ROLE_ADMIN");
        vm.prank(account1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                account1,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.setRoleAdmin(TEST_ROLE, roleAdmin);
    }

    function test_TransferOwnershipTransfersAllRolesThroughProxy() public {
        token.grantRole(TEST_ROLE, owner);
        token.grantRole(EXTRA_ROLE, owner);

        token.transferOwnership(account1);

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(token.hasRole(EXTRA_ROLE, owner));
        assertFalse(token.hasRole(TEST_ROLE, owner));
        assertEq(token.rolesOf(owner).length, 0);

        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, account1));
        assertTrue(token.hasRole(EXTRA_ROLE, account1));
        assertTrue(token.hasRole(TEST_ROLE, account1));
        assertEq(token.rolesOf(account1).length, 3);
    }

    function test_RenounceOwnershipRevokesAllRolesThroughProxy() public {
        token.grantRole(TEST_ROLE, owner);

        token.renounceOwnership();

        assertFalse(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(token.hasRole(TEST_ROLE, owner));
        assertEq(token.rolesOf(owner).length, 0);
    }

    function test_OwnerCannotRenounceDefaultAdminRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                owner,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.renounceRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function testFuzz_DefaultAdminCanSetRoleAdminThroughProxy(
        bytes32 role,
        bytes32 roleAdmin
    ) public {
        token.setRoleAdmin(role, roleAdmin);
        assertEq(token.getRoleAdmin(role), roleAdmin);
    }

    function testFuzz_NonDefaultAdminCannotSetRoleAdminThroughProxy(
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
}
