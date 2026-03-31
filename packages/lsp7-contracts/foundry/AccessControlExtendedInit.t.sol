// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {
    AccessControlExtendedInitAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol";

// proxy
import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// interfaces
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    IAccessControlEnumerable
} from "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";
import {
    IAccessControlExtended
} from "../contracts/extensions/AccessControlExtended/IAccessControlExtended.sol";
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
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";

// Mock contract for testing the InitAbstract variant
contract MockAccessControlExtendedInit is AccessControlExtendedInitAbstract {
    bytes32 public constant TEST_ROLE = bytes32(bytes("TestRole"));

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) external initializer {
        __AccessControlExtended_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
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

contract AccessControlExtendedInitTest is Test {
    string name = "Test Token";
    string symbol = "TT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;

    address tokenOwner = address(this);
    address account1 = vm.addr(101);
    address account2 = vm.addr(102);
    address account3 = vm.addr(103);

    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 constant TEST_ROLE = bytes32(bytes("TestRole"));

    MockAccessControlExtendedInit implementation;
    MockAccessControlExtendedInit token; // proxy cast

    function setUp() public {
        // 1. Deploy the logic/implementation contract
        implementation = new MockAccessControlExtendedInit();

        // 2. Encode the initialize call as initData
        bytes memory initData = abi.encodeCall(
            MockAccessControlExtendedInit.initialize,
            (name, symbol, tokenOwner, tokenType, isNonDivisible)
        );

        // 3. Deploy ERC1967Proxy with implementation + initData
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        // 4. Cast proxy address to mock interface for test calls
        token = MockAccessControlExtendedInit(payable(address(proxy)));
    }

    // ============================================================
    // Section 1: Initialization (TEST-03)
    // ============================================================

    function test_InitializeSetsOwnerAndDefaultAdmin() public {
        assertEq(
            token.owner(),
            tokenOwner,
            "Owner should be set after initialize"
        );
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, tokenOwner),
            "Owner should have DEFAULT_ADMIN_ROLE after initialize"
        );
    }

    function test_InitializeDoesNotGrantArbitraryRolesToOwner() public {
        assertFalse(
            token.hasRole(TEST_ROLE, tokenOwner),
            "Owner should not have TEST_ROLE unless explicitly granted"
        );
    }

    function test_InitializeRevertsOnDoubleInit() public {
        vm.expectRevert("Initializable: contract is already initialized");
        token.initialize(name, symbol, tokenOwner, tokenType, isNonDivisible);
    }

    // ============================================================
    // Section 2: Functional parity with Abstract (TEST-03)
    // ============================================================

    function test_InitGrantRoleWorks() public {
        token.grantRole(TEST_ROLE, account1);
        assertTrue(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should have TEST_ROLE"
        );
    }

    function test_InitRevokeRoleWorks() public {
        token.grantRole(TEST_ROLE, account1);
        token.revokeRole(TEST_ROLE, account1);
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should not have TEST_ROLE after revocation"
        );
    }

    function test_InitRolesOfWorks() public {
        token.grantRole(TEST_ROLE, account1);
        bytes32[] memory roles = token.rolesOf(account1);
        assertEq(roles.length, 1, "Account1 should have 1 role");
        assertEq(roles[0], TEST_ROLE, "Role should be TEST_ROLE");
    }

    function test_InitGrantRoleWithDataWorks() public {
        bytes memory data = abi.encodePacked(uint256(42));
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

    function test_InitSetRoleDataWorks() public {
        bytes memory data = abi.encodePacked(uint256(100));
        token.setRoleData(TEST_ROLE, account1, data);

        assertEq(
            token.getRoleData(TEST_ROLE, account1),
            data,
            "Data should be stored via setRoleData"
        );
    }

    function test_InitRevokeRoleClearsData() public {
        bytes memory data = abi.encodePacked(uint256(200));
        token.grantRoleWithData(TEST_ROLE, account1, data);

        token.revokeRole(TEST_ROLE, account1);

        assertEq(
            token.getRoleData(TEST_ROLE, account1).length,
            0,
            "Data should be cleared after revocation"
        );
    }

    function test_InitRenounceRoleWorks() public {
        token.grantRole(TEST_ROLE, account1);

        vm.prank(account1);
        token.renounceRole(TEST_ROLE, account1);

        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "Account1 should not have TEST_ROLE after renounce"
        );
    }

    function test_InitOwnerCannotRenounceDefaultAdminRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                tokenOwner,
                DEFAULT_ADMIN_ROLE
            )
        );
        token.renounceRole(DEFAULT_ADMIN_ROLE, tokenOwner);
    }

    function test_InitOnlyRoleDoesNotBypassOwner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                tokenOwner,
                TEST_ROLE
            )
        );
        token.restrictedFunction();
    }

    // ============================================================
    // Section 3: Storage layout safety (TEST-03)
    // ============================================================

    function test_StorageLayoutCompatibleWithProxy() public {
        bytes32 roleA = bytes32(bytes("RoleA"));
        bytes32 roleB = bytes32(bytes("RoleB"));
        bytes memory dataA1 = abi.encodePacked(uint256(1000));
        bytes memory dataA2 = abi.encodePacked(uint256(2000));
        bytes memory dataB1 = abi.encodePacked(uint256(3000));

        // Grant multiple roles with data to multiple accounts through proxy
        token.grantRoleWithData(roleA, account1, dataA1);
        token.grantRoleWithData(roleA, account2, dataA2);
        token.grantRoleWithData(roleB, account1, dataB1);
        token.grantRole(roleB, account3);

        // Read all state back through proxy and verify consistency
        // hasRole
        assertTrue(
            token.hasRole(roleA, account1),
            "account1 should have roleA"
        );
        assertTrue(
            token.hasRole(roleA, account2),
            "account2 should have roleA"
        );
        assertTrue(
            token.hasRole(roleB, account1),
            "account1 should have roleB"
        );
        assertTrue(
            token.hasRole(roleB, account3),
            "account3 should have roleB"
        );
        assertFalse(
            token.hasRole(roleA, account3),
            "account3 should not have roleA"
        );

        // getRoleMemberCount
        assertEq(
            token.getRoleMemberCount(roleA),
            2,
            "roleA should have 2 members"
        );
        assertEq(
            token.getRoleMemberCount(roleB),
            2,
            "roleB should have 2 members"
        );

        // getRoleMember
        assertEq(
            token.getRoleMember(roleA, 0),
            account1,
            "roleA member 0 should be account1"
        );
        assertEq(
            token.getRoleMember(roleA, 1),
            account2,
            "roleA member 1 should be account2"
        );

        // rolesOf (reverse lookup)
        bytes32[] memory account1Roles = token.rolesOf(account1);
        assertEq(account1Roles.length, 2, "account1 should have 2 roles");

        // getRoleData
        assertEq(
            token.getRoleData(roleA, account1),
            dataA1,
            "account1 roleA data should match"
        );
        assertEq(
            token.getRoleData(roleA, account2),
            dataA2,
            "account2 roleA data should match"
        );
        assertEq(
            token.getRoleData(roleB, account1),
            dataB1,
            "account1 roleB data should match"
        );
    }

    function test_InitStorageConsistentAcrossProxyCalls() public {
        // Grant roles through proxy
        token.grantRole(TEST_ROLE, account1);
        token.grantRole(TEST_ROLE, account2);

        // Read through proxy - verify state is correct across separate calls
        assertTrue(token.hasRole(TEST_ROLE, account1), "account1 has role");
        assertTrue(token.hasRole(TEST_ROLE, account2), "account2 has role");
        assertEq(
            token.getRoleMemberCount(TEST_ROLE),
            2,
            "Member count should be 2"
        );

        // Revoke and verify state updates are persistent
        token.revokeRole(TEST_ROLE, account1);
        assertFalse(
            token.hasRole(TEST_ROLE, account1),
            "account1 should not have role after revoke"
        );
        assertEq(
            token.getRoleMemberCount(TEST_ROLE),
            1,
            "Member count should be 1 after revoke"
        );
    }

    function test_InitEnumerationWorksAfterMultipleGrants() public {
        bytes32 roleX = bytes32(bytes("RoleX"));
        bytes32 roleY = bytes32(bytes("RoleY"));

        // Forward enumeration: grant to multiple accounts
        token.grantRole(roleX, account1);
        token.grantRole(roleX, account2);
        token.grantRole(roleX, account3);

        assertEq(
            token.getRoleMemberCount(roleX),
            3,
            "roleX should have 3 members"
        );
        assertEq(token.getRoleMember(roleX, 0), account1);
        assertEq(token.getRoleMember(roleX, 1), account2);
        assertEq(token.getRoleMember(roleX, 2), account3);

        // Reverse enumeration: grant multiple roles to one account
        token.grantRole(roleY, account1);

        bytes32[] memory account1Roles = token.rolesOf(account1);
        assertEq(
            account1Roles.length,
            2,
            "account1 should have 2 roles via reverse lookup"
        );

        // Verify consistency: each role in rolesOf should return true for hasRole
        for (uint256 i = 0; i < account1Roles.length; i++) {
            assertTrue(
                token.hasRole(account1Roles[i], account1),
                "hasRole should be true for each enumerated role"
            );
        }
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

    // function testFuzz_DoesNotSupportRandomInterface(bytes4 interfaceId) public {
    //     // TODO: test fails currently. Should be fixed once we remove LSP7 from inheritance chain.
    //     vm.skip(true);
    //     vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROL);
    //     vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROLENUMERABLE);
    //     vm.assume(interfaceId != _INTERFACEID_ACCESSCONTROLEXTENDED);

    //     assertFalse(
    //         token.supportsInterface(interfaceId),
    //         "Should not support random interface"
    //     );
    // }
    //     assertFalse(
    //         token.supportsInterface(interfaceId),
    //         "Should not support random interface"
    //     );
    // }
}
