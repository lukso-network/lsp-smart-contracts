// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

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
    LSP7NotRevokable
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockLSP7RevokableInit is LSP7RevokableInitAbstract {
    function initialize(address newOwner_, bool isRevokable_) external initializer {
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

    MockLSP7RevokableInit implementation;
    MockLSP7RevokableInit token;

    function setUp() public {
        implementation = new MockLSP7RevokableInit();

        bytes memory initData = abi.encodeCall(
            MockLSP7RevokableInit.initialize,
            (owner, true)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        token = MockLSP7RevokableInit(payable(address(proxy)));
    }

    function test_InitializeSetsOwnerRevokerRoleAndRevokableStatus() public {
        bytes32 revokerRole = token.REVOKER_ROLE();

        assertEq(token.owner(), owner);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertTrue(token.hasRole(revokerRole, owner));
        assertEq(token.getRoleMemberCount(revokerRole), 1);
        assertTrue(token.isRevokable());
        assertTrue(token._isRevokable());
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
        token.mint(user1, 1000, true, "");

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
        token.revoke(user1, newOwner, 100, "");

        vm.prank(newOwner);
        token.grantRole(revokerRole, newOwner);

        vm.prank(newOwner);
        token.revoke(user1, newOwner, 500, "");

        assertEq(token.balanceOf(user1), 500);
        assertEq(token.balanceOf(newOwner), 500);
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        MockLSP7RevokableInit disabledImplementation = new MockLSP7RevokableInit();
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
        assertFalse(disabledToken._isRevokable());

        vm.expectRevert(LSP7NotRevokable.selector);
        disabledToken.revoke(user1, owner, 500, "");
    }
}
