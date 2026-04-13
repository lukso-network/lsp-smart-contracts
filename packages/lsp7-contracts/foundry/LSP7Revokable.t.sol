// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {
    LSP7RevokableAbstract
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableAbstract.sol";
import {LSP7DigitalAsset} from "../contracts/LSP7DigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {LSP7AmountExceedsBalance} from "../contracts/LSP7Errors.sol";
import {
    LSP7RevokableFeatureDisabled
} from "../contracts/extensions/LSP7Revokable/LSP7RevokableErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

/// @dev Mock contract to test LSP7RevokableAbstract functionality
contract MockLSP7Revokable is LSP7RevokableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool isRevokable_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract(newOwner_)
        LSP7RevokableAbstract(newOwner_, isRevokable_)
    {}

    /// @dev Helper function to mint tokens for testing
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}

contract LSP7RevokableTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    string name = "Revokable Token";
    string symbol = "RT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_TOKEN;
    bool isNonDivisible = false;
    bool isRevokable = true;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address revoker1 = vm.addr(103);
    address revoker2 = vm.addr(104);

    MockLSP7Revokable lsp7Revokable;

    function setUp() public {
        lsp7Revokable = new MockLSP7Revokable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            isRevokable
        );

        // Label addresses for better trace output
        vm.label(address(lsp7Revokable), "LSP7Revokable");
        vm.label(owner, "owner");
        vm.label(nonOwner, "nonOwner");
        vm.label(user1, "user1");
        vm.label(user2, "user2");
        vm.label(revoker1, "revoker1");
        vm.label(revoker2, "revoker2");
    }

    // =========================================================================
    // Constructor / Initialization Tests
    // =========================================================================

    function test_ConstructorInitializesRolesCorrectly() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        assertTrue(
            lsp7Revokable.hasRole(revokerRole, owner),
            "Owner should start with REVOKER_ROLE"
        );
        assertEq(
            lsp7Revokable.getRoleMemberCount(revokerRole),
            1,
            "Only owner should hold REVOKER_ROLE initially"
        );
        assertTrue(
            lsp7Revokable.hasRole(DEFAULT_ADMIN_ROLE, owner),
            "Owner should start with DEFAULT_ADMIN_ROLE"
        );
        assertFalse(
            lsp7Revokable.hasRole(revokerRole, nonOwner),
            "Non-owner should not start with REVOKER_ROLE"
        );
    }

    function test_ConstructorInitializesRevokableStatus() public {
        assertTrue(
            lsp7Revokable.isRevokable(),
            "Revokable feature should be enabled"
        );
    }

    // =========================================================================
    // Revoker Role Management Tests
    // =========================================================================

    function test_DefaultAdminCanGrantMultipleRevokers() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        lsp7Revokable.grantRole(revokerRole, revoker2);

        assertEq(
            lsp7Revokable.getRoleMemberCount(revokerRole),
            3,
            "Owner and both delegated revokers should be enumerated"
        );
        assertTrue(
            lsp7Revokable.hasRole(revokerRole, revoker1),
            "Revoker1 should have REVOKER_ROLE"
        );
        assertEq(
            lsp7Revokable.getRoleMember(revokerRole, 0),
            owner,
            "Owner should be the first role member"
        );
        assertEq(
            lsp7Revokable.getRoleMember(revokerRole, 1),
            revoker1,
            "Revoker1 should be enumerable"
        );
        assertEq(
            lsp7Revokable.getRoleMember(revokerRole, 2),
            revoker2,
            "Revoker2 should be enumerable"
        );
    }

    function test_DefaultAdminCanDelegateRevokerManagement() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();
        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                DEFAULT_ADMIN_ROLE
            )
        );
        lsp7Revokable.grantRole(revokerRole, revoker1);

        lsp7Revokable.grantRole(DEFAULT_ADMIN_ROLE, nonOwner);

        vm.prank(nonOwner);
        lsp7Revokable.grantRole(revokerRole, revoker1);

        assertTrue(
            lsp7Revokable.hasRole(revokerRole, revoker1),
            "Delegated admin should be able to grant REVOKER_ROLE"
        );
    }

    function test_RevokerCanRenounceRoleForItself() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        assertTrue(lsp7Revokable.hasRole(revokerRole, revoker1));

        vm.prank(revoker1);
        lsp7Revokable.renounceRole(revokerRole, revoker1);

        assertFalse(
            lsp7Revokable.hasRole(revokerRole, revoker1),
            "Revoker should be able to renounce its own role"
        );
    }

    // =========================================================================
    // Revoke Tests
    // =========================================================================

    function test_RevokeAsOwner() public {
        _mintTo(user1, 1000);

        lsp7Revokable.revoke(user1, owner, 500, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            500,
            "User1 should have 500 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            500,
            "Owner should receive revoked tokens"
        );
    }

    function test_RevokeAsDelegatedRevokerToOwner() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, 1000);

        vm.prank(revoker1);
        lsp7Revokable.revoke(user1, owner, 300, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            700,
            "User1 should have 700 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            300,
            "Owner should have 300 tokens"
        );
    }

    function test_RevokeAsDelegatedRevokerToAnotherRevoker() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        lsp7Revokable.grantRole(revokerRole, revoker2);
        _mintTo(user1, 1000);

        vm.prank(revoker1);
        lsp7Revokable.revoke(user1, revoker2, 300, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            700,
            "User1 should have 700 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(revoker2),
            300,
            "Another revoker should receive revoked tokens"
        );
    }

    function test_RevokeAsDelegatedRevokerToSelf() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, 1000);

        vm.prank(revoker1);
        lsp7Revokable.revoke(user1, revoker1, 400, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            600,
            "User1 should have 600 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(revoker1),
            400,
            "Revoker should be able to revoke tokens to itself"
        );
    }

    function test_RevokeFailsForNonRevoker() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        _mintTo(user1, 1000);

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                revokerRole
            )
        );
        lsp7Revokable.revoke(user1, owner, 500, "");
    }

    function test_RevokeFailsWhenRevocationIsDisabled() public {
        MockLSP7Revokable nonRevokableToken = new MockLSP7Revokable(
            name,
            symbol,
            owner,
            tokenType,
            isNonDivisible,
            false
        );

        nonRevokableToken.mint(user1, 1000, true, "");

        assertFalse(
            nonRevokableToken.isRevokable(),
            "Revokable feature should be disabled"
        );

        vm.expectRevert(LSP7RevokableFeatureDisabled.selector);
        nonRevokableToken.revoke(user1, owner, 500, "");
    }

    function test_RevokeFailsWhenDestinationHasNoRevokerRole() public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        lsp7Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, 1000);

        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user2,
                revokerRole
            )
        );
        lsp7Revokable.revoke(user1, user2, 500, "");
    }

    function test_RevokeFailsForUserWithoutTokens() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsBalance.selector,
                0,
                user1,
                500
            )
        );
        lsp7Revokable.revoke(user1, owner, 500, "");
    }

    function test_RevokeFailsWhenAmountExceedsBalance() public {
        _mintTo(user1, 100);

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7AmountExceedsBalance.selector,
                100,
                user1,
                500
            )
        );
        lsp7Revokable.revoke(user1, owner, 500, "");
    }

    function test_RevokeZeroAmount() public {
        _mintTo(user1, 1000);

        lsp7Revokable.revoke(user1, owner, 0, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            1000,
            "User1 should still have 1000 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            0,
            "Owner should still have 0 tokens"
        );
    }

    // =========================================================================
    // Ownership Transfer Tests
    // =========================================================================

    function test_TransferOwnershipClearsRevokerListAndGrantsNewOwnerRole()
        public
    {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();
        address newOwner = vm.addr(200);

        lsp7Revokable.grantRole(revokerRole, revoker1);
        lsp7Revokable.grantRole(revokerRole, revoker2);
        _mintTo(user1, 1000);

        lsp7Revokable.transferOwnership(newOwner);

        // CHECK old owner + revokers have been removed their roles
        assertFalse(
            lsp7Revokable.hasRole(revokerRole, owner),
            "Old owner should lose REVOKER_ROLE after ownership transfer"
        );
        assertFalse(
            lsp7Revokable.hasRole(revokerRole, revoker1),
            "Existing delegated revokers should be cleared"
        );

        // CHECK previous revokers cannot revoke tokens anymore
        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revoker1,
                revokerRole
            )
        );
        lsp7Revokable.revoke(user1, newOwner, 100, "");

        // new owner should grant itself the `REVOKER_ROLE` first to be able to revoke tokens
        // (extension specific roles are not passed between old and new owners)
        vm.prank(newOwner);
        lsp7Revokable.grantRole(revokerRole, newOwner);

        vm.prank(newOwner);
        lsp7Revokable.revoke(user1, newOwner, 500, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            500,
            "User1 should have 500 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(newOwner),
            500,
            "New owner should have 500 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            0,
            "Old owner should have 0 tokens"
        );
    }

    // =========================================================================
    // Fuzzing Tests
    // =========================================================================

    function testFuzz_DefaultAdminCanGrantRevokerRole(address addr) public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        vm.assume(addr != address(0));
        vm.assume(addr != owner);

        vm.prank(addr);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                addr,
                DEFAULT_ADMIN_ROLE
            )
        );
        lsp7Revokable.grantRole(revokerRole, addr);

        lsp7Revokable.grantRole(revokerRole, addr);
        assertTrue(lsp7Revokable.hasRole(revokerRole, addr));
    }

    function testFuzz_RevokeAmount(
        address from,
        uint256 mintAmount,
        uint256 revokeAmount
    ) public {
        vm.assume(from != address(0));
        vm.assume(from != owner);
        vm.assume(uint160(from) > 10); // Exclude precompile addresses (0x1-0x9)
        vm.assume(mintAmount > 0);
        vm.assume(mintAmount <= type(uint128).max); // Reasonable upper bound
        vm.assume(revokeAmount <= mintAmount);

        lsp7Revokable.mint(from, mintAmount, true, "");

        lsp7Revokable.revoke(from, owner, revokeAmount, "");

        assertEq(
            lsp7Revokable.balanceOf(from),
            mintAmount - revokeAmount,
            "From balance should decrease"
        );
        assertEq(
            lsp7Revokable.balanceOf(owner),
            revokeAmount,
            "Owner balance should increase"
        );
    }

    function testFuzz_NonRevokerCannotRevoke(address caller) public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        vm.assume(caller != owner);
        vm.assume(caller != address(0));

        _mintTo(user1, 1000);

        vm.prank(caller);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                caller,
                revokerRole
            )
        );
        lsp7Revokable.revoke(user1, owner, 500, "");
    }

    function testFuzz_DelegatedRevokerCanRevoke(
        address delegatedRevoker
    ) public {
        bytes32 revokerRole = lsp7Revokable.REVOKER_ROLE();

        vm.assume(delegatedRevoker != owner);
        vm.assume(delegatedRevoker != address(0));
        vm.assume(delegatedRevoker != user1);
        vm.assume(uint160(delegatedRevoker) > 10);

        lsp7Revokable.grantRole(revokerRole, delegatedRevoker);
        _mintTo(user1, 1000);

        vm.prank(delegatedRevoker);
        lsp7Revokable.revoke(user1, delegatedRevoker, 500, "");

        assertEq(
            lsp7Revokable.balanceOf(user1),
            500,
            "User1 should have 500 tokens"
        );
        assertEq(
            lsp7Revokable.balanceOf(delegatedRevoker),
            500,
            "Delegated revoker should receive revoked tokens"
        );
    }

    function _mintTo(address to, uint256 amount) internal {
        lsp7Revokable.mint(to, amount, true, "");
    }
}
