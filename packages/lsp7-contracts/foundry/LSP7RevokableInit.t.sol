// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test, Vm} from "forge-std/Test.sol";

// interfaces
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";

// modules
import {
    LSP7RevokableInitAbstract
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableInitAbstract.sol";

// proxy
import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP7RevokableFeatureDisabled
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7RevokableInit is LSP7RevokableInitAbstract {
    function initialize(
        address newOwner_,
        bool isRevokable_
    ) external initializer {
        __LSP7Revokable_init(
            "Revokable Token",
            "RT",
            newOwner_,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            isRevokable_
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
}

contract LSP7RevokableInitTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address owner = address(this);
    address user1 = vm.addr(101);
    address revoker1 = vm.addr(103);
    address revoker2 = vm.addr(104);

    MockLSP7RevokableInit implementation;
    MockLSP7RevokableInit token;

    function setUp() public {
        implementation = new MockLSP7RevokableInit();

        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (owner, true)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        token = MockLSP7RevokableInit(payable(address(proxy)));
    }

    function test_InitializeSetsOwnerRevokerRoleAndRevokableStatus() public {
        bytes32 revokerRole = token.REVOKER_ROLE();

        assertEq(token.owner(), owner);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertTrue(token.hasRole(revokerRole, owner));
        assertEq(token.getRoleMemberCount(revokerRole), 1);
        assertTrue(token.isRevokable());
    }

    function test_DeployWithoutRevokableFeatureDoesNotGrantRevokerRoleToOwner()
        public
    {
        address contractOwner = makeAddr("contractOwner");
        MockLSP7RevokableInit disabledImplementation = new MockLSP7RevokableInit();
        bytes32 revokerRole = disabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (contractOwner, false)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(disabledImplementation),
            initData
        );
        MockLSP7RevokableInit tokenContract = MockLSP7RevokableInit(
            payable(address(proxy))
        );

        assertFalse(tokenContract.hasRole(revokerRole, contractOwner));
        assertTrue(tokenContract.hasRole(DEFAULT_ADMIN_ROLE, contractOwner));

        bytes32[] memory ownerRoles = tokenContract.rolesOf(contractOwner);
        assertEq(ownerRoles.length, 1);
        assertEq(ownerRoles[0], DEFAULT_ADMIN_ROLE);
    }

    function test_DeployWithRevokableFeatureGrantsRevokerRoleToOwnerAndEmitsRoleGranted()
        public
    {
        address contractOwner = makeAddr("contractOwner");
        MockLSP7RevokableInit enabledImplementation = new MockLSP7RevokableInit();
        bytes32 revokerRole = enabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (contractOwner, true)
        );

        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleGranted(
            revokerRole,
            contractOwner,
            address(this)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(enabledImplementation),
            initData
        );
        MockLSP7RevokableInit tokenContract = MockLSP7RevokableInit(
            payable(address(proxy))
        );

        assertTrue(tokenContract.hasRole(revokerRole, contractOwner));
        assertTrue(tokenContract.hasRole(DEFAULT_ADMIN_ROLE, contractOwner));

        bytes32[] memory ownerRoles = tokenContract.rolesOf(contractOwner);
        assertEq(ownerRoles.length, 2);
        assertEq(ownerRoles[0], DEFAULT_ADMIN_ROLE);
        assertEq(ownerRoles[1], revokerRole);
    }

    function test_InitializeEmitsRoleGrantedForOwnerWhenRevokable() public {
        MockLSP7RevokableInit enabledImplementation = new MockLSP7RevokableInit();
        bytes32 revokerRole = enabledImplementation.REVOKER_ROLE();

        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (owner, true)
        );

        vm.recordLogs();
        new ERC1967Proxy(address(enabledImplementation), initData);

        Vm.Log[] memory recordedLogs = vm.getRecordedLogs();

        uint256 thirdToLastLog = recordedLogs.length - 3;

        // `RoleGranted` event MUST be for `DEFAULT_ADMIN_ROLE`
        assertEq(
            recordedLogs[thirdToLastLog].topics[0],
            IAccessControl.RoleGranted.selector
        );
        assertEq(recordedLogs[thirdToLastLog].topics[1], DEFAULT_ADMIN_ROLE);
        assertEq(
            recordedLogs[thirdToLastLog].topics[2],
            bytes32(uint256(uint160(owner)))
        );
        assertEq(
            recordedLogs[thirdToLastLog].topics[3],
            bytes32(uint256(uint160(owner)))
        );

        uint256 secondToLastLog = recordedLogs.length - 2;

        // Another `RoleGranted` event MUST be for `REVOKER_ROLE`
        assertEq(
            recordedLogs[secondToLastLog].topics[0],
            IAccessControl.RoleGranted.selector
        );
        assertEq(recordedLogs[secondToLastLog].topics[1], revokerRole);
        assertEq(
            recordedLogs[secondToLastLog].topics[2],
            bytes32(uint256(uint160(owner)))
        );
        assertEq(
            recordedLogs[secondToLastLog].topics[3],
            bytes32(uint256(uint160(owner)))
        );
    }

    function test_InitializeDoesNotGrantRevokerRoleToOwnerWhenNotRevokable()
        public
    {
        MockLSP7RevokableInit disabledImplementation = new MockLSP7RevokableInit();
        bytes32 revokerRole = disabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (owner, false)
        );

        vm.recordLogs();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(disabledImplementation),
            initData
        );
        MockLSP7RevokableInit disabledToken = MockLSP7RevokableInit(
            payable(address(proxy))
        );

        assertFalse(disabledToken.isRevokable());
        assertFalse(disabledToken.hasRole(revokerRole, owner));
        assertEq(disabledToken.getRoleMemberCount(revokerRole), 0);

        Vm.Log[] memory recordedLogs = vm.getRecordedLogs();

        uint256 roleGrantedLogCount = 0;

        for (uint256 i = 0; i < recordedLogs.length; i++) {
            if (
                recordedLogs[i].topics[0] == IAccessControl.RoleGranted.selector
            ) {
                roleGrantedLogCount++;
                assertEq(recordedLogs[i].topics[1], DEFAULT_ADMIN_ROLE);
                assertEq(
                    recordedLogs[i].topics[2],
                    bytes32(uint256(uint160(owner)))
                );
                assertEq(
                    recordedLogs[i].topics[3],
                    bytes32(uint256(uint160(owner)))
                );
            }
        }

        assertEq(roleGrantedLogCount, 1);
    }

    function test_RevokeThroughProxy() public {
        token.mint(user1, 1000, true, "");

        token.revoke(user1, owner, 500, "");

        assertEq(token.balanceOf(user1), 500);
        assertEq(token.balanceOf(owner), 500);
    }

    function test_TransferOwnershipClearsRevokersThroughProxy() public {
        bytes32 revokerRole = token.REVOKER_ROLE();
        address newOwner = vm.addr(200);

        token.grantRole(revokerRole, revoker1);
        token.grantRole(revokerRole, revoker2);
        token.mint(user1, 1000, true, "");

        assertEq(
            token.getRoleMemberCount(revokerRole),
            3,
            "Owner and delegated revokers should be registered before transfer"
        );

        token.transferOwnership(newOwner);

        assertEq(
            token.getRoleMemberCount(revokerRole),
            0,
            "All revokers should be cleared on ownership transfer"
        );
        assertFalse(token.hasRole(revokerRole, owner));
        assertFalse(token.hasRole(revokerRole, revoker1));
        assertFalse(token.hasRole(revokerRole, revoker2));
        assertFalse(token.hasRole(revokerRole, newOwner));
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, newOwner));

        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revoker1,
                revokerRole
            )
        );
        token.revoke(user1, newOwner, 100, "");

        vm.prank(newOwner);
        token.grantRole(revokerRole, newOwner);

        vm.prank(newOwner);
        token.revoke(user1, newOwner, 500, "");

        assertEq(token.balanceOf(user1), 500);
        assertEq(token.balanceOf(newOwner), 500);
    }

    function test_TransferOwnershipClearsSpecificRoleAdminsThroughProxy()
        public
    {
        bytes32 revokerRole = token.REVOKER_ROLE();
        bytes32 revokerAdminRole = keccak256("REVOKER_ADMIN_ROLE");
        address revokerAdmin = makeAddr("A Revoker Admin");

        token.setRoleAdmin(revokerRole, revokerAdminRole);
        assertEq(token.getRoleAdmin(revokerRole), revokerAdminRole);

        token.grantRole(revokerAdminRole, revokerAdmin);
        assertTrue(token.hasRole(revokerAdminRole, revokerAdmin));

        vm.prank(revokerAdmin);
        token.grantRole(revokerRole, address(11111));
        assertTrue(token.hasRole(revokerRole, address(11111)));

        token.transferOwnership(vm.addr(200));

        assertEq(token.getRoleAdmin(revokerRole), DEFAULT_ADMIN_ROLE);

        // Test previous admin cannot use its role
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revokerAdmin,
                DEFAULT_ADMIN_ROLE
            )
        );
        vm.prank(revokerAdmin);
        token.grantRole(revokerRole, address(22222));

        // sanity check revoker was removed after transferring ownership
        assertFalse(token.hasRole(revokerRole, address(11111)));
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        MockLSP7RevokableInit disabledImplementation = new MockLSP7RevokableInit();
        bytes32 revokerRole = disabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (owner, false)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(disabledImplementation),
            initData
        );
        MockLSP7RevokableInit disabledToken = MockLSP7RevokableInit(
            payable(address(proxy))
        );

        disabledToken.mint(user1, 1000, true, "");

        assertFalse(disabledToken.isRevokable());
        assertFalse(disabledToken.hasRole(revokerRole, owner));

        disabledToken.grantRole(revokerRole, owner);

        vm.expectRevert(LSP7RevokableFeatureDisabled.selector);
        disabledToken.revoke(user1, owner, 500, "");
    }
}
