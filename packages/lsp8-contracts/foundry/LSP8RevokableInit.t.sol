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
    LSP8RevokableInitAbstract
} from "../contracts/extensions/LSP8Revokable/LSP8RevokableInitAbstract.sol";

// proxy
import {
    ERC1967Proxy
} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP8RevokableFeatureDisabled
} from "../contracts/extensions/LSP8Revokable/LSP8RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

contract MockLSP8RevokableInit is LSP8RevokableInitAbstract {
    function initialize(
        address newOwner_,
        bool isRevokable_
    ) external initializer {
        __LSP8Revokable_init(
            "Revokable NFT",
            "RNFT",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER,
            isRevokable_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}

contract LSP8RevokableInitTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    address owner = address(this);
    address user1 = vm.addr(101);
    address revoker1 = vm.addr(103);

    bytes32 tokenId1 = bytes32(uint256(1));

    MockLSP8RevokableInit implementation;
    MockLSP8RevokableInit token;

    function setUp() public {
        implementation = new MockLSP8RevokableInit();

        bytes memory initData = abi.encodeCall(
            MockLSP8RevokableInit.initialize,
            (owner, true)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        token = MockLSP8RevokableInit(payable(address(proxy)));
    }

    function test_InitializeSetsOwnerAndRevokerRole() public {
        bytes32 revokerRole = token.REVOKER_ROLE();

        assertEq(token.owner(), owner);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertTrue(token.hasRole(revokerRole, owner));
        assertEq(token.getRoleMemberCount(revokerRole), 1);
        assertTrue(token.isRevokable());
    }

    function test_InitializeEmitsRoleGrantedForOwnerWhenRevokable() public {
        MockLSP8RevokableInit enabledImplementation = new MockLSP8RevokableInit();
        bytes32 revokerRole = enabledImplementation.REVOKER_ROLE();

        bytes memory initData = abi.encodeCall(
            MockLSP8RevokableInit.initialize,
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
        MockLSP8RevokableInit disabledImplementation = new MockLSP8RevokableInit();
        bytes32 revokerRole = disabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP8RevokableInit.initialize,
            (owner, false)
        );

        vm.recordLogs();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(disabledImplementation),
            initData
        );
        MockLSP8RevokableInit disabledToken = MockLSP8RevokableInit(
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
        token.mint(user1, tokenId1, true, "");

        token.revoke(user1, owner, tokenId1, "");

        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(owner), 1);
        assertEq(token.tokenOwnerOf(tokenId1), owner);
    }

    function test_TransferOwnershipClearsRevokersThroughProxy() public {
        bytes32 revokerRole = token.REVOKER_ROLE();
        address newOwner = vm.addr(200);

        token.grantRole(revokerRole, revoker1);
        token.mint(user1, tokenId1, true, "");

        token.transferOwnership(newOwner);

        assertFalse(token.hasRole(revokerRole, owner));
        assertFalse(token.hasRole(revokerRole, revoker1));
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, newOwner));

        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revoker1,
                revokerRole
            )
        );
        token.revoke(user1, newOwner, tokenId1, "");

        vm.prank(newOwner);
        token.grantRole(revokerRole, newOwner);

        vm.prank(newOwner);
        token.revoke(user1, newOwner, tokenId1, "");

        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(newOwner), 1);
        assertEq(token.tokenOwnerOf(tokenId1), newOwner);
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
        MockLSP8RevokableInit disabledImplementation = new MockLSP8RevokableInit();
        bytes32 revokerRole = disabledImplementation.REVOKER_ROLE();
        bytes memory initData = abi.encodeCall(
            MockLSP8RevokableInit.initialize,
            (owner, false)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(disabledImplementation),
            initData
        );
        MockLSP8RevokableInit disabledToken = MockLSP8RevokableInit(
            payable(address(proxy))
        );

        disabledToken.mint(user1, tokenId1, true, "");

        assertFalse(disabledToken.isRevokable());
        assertFalse(disabledToken.hasRole(revokerRole, owner));

        disabledToken.grantRole(revokerRole, owner);

        vm.expectRevert(LSP8RevokableFeatureDisabled.selector);
        disabledToken.revoke(user1, owner, tokenId1, "");
    }
}
