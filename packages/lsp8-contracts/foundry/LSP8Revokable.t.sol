// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {
    LSP8RevokableAbstract
} from "../contracts/extensions/LSP8Revokable/LSP8RevokableAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../contracts/LSP8IdentifiableDigitalAsset.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP8NotTokenOwner,
    LSP8NonExistentTokenId
} from "../contracts/LSP8Errors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

contract MockLSP8Revokable is LSP8RevokableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract(newOwner_)
        LSP8RevokableAbstract(newOwner_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}

contract LSP8RevokableTest is Test {
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

    string name = "Revokable NFT";
    string symbol = "RNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address revoker1 = vm.addr(103);
    address revoker2 = vm.addr(104);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));
    bytes32 tokenId4 = bytes32(uint256(4));

    MockLSP8Revokable lsp8Revokable;

    function setUp() public {
        lsp8Revokable = new MockLSP8Revokable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat
        );
    }

    function test_ConstructorInitializesRolesCorrectly() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();

        assertTrue(lsp8Revokable.hasRole(revokerRole, owner));
        assertEq(lsp8Revokable.getRoleMemberCount(revokerRole), 1);
        assertTrue(lsp8Revokable.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertFalse(lsp8Revokable.hasRole(revokerRole, nonOwner));
    }

    function test_DefaultAdminCanGrantMultipleRevokers() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();

        lsp8Revokable.grantRole(revokerRole, revoker1);
        lsp8Revokable.grantRole(revokerRole, revoker2);

        assertEq(lsp8Revokable.getRoleMemberCount(revokerRole), 3);
        assertTrue(lsp8Revokable.hasRole(revokerRole, revoker1));
        assertEq(lsp8Revokable.getRoleMember(revokerRole, 0), owner);
        assertEq(lsp8Revokable.getRoleMember(revokerRole, 1), revoker1);
        assertEq(lsp8Revokable.getRoleMember(revokerRole, 2), revoker2);
    }

    function test_RevokeAsOwner() public {
        _mintTo(user1, tokenId1);

        lsp8Revokable.revoke(user1, owner, tokenId1, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(owner), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId1), owner);
    }

    function test_RevokeAsDelegatedRevokerToOwner() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        lsp8Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, tokenId1);

        vm.prank(revoker1);
        lsp8Revokable.revoke(user1, owner, tokenId1, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(owner), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId1), owner);
    }

    function test_RevokeAsDelegatedRevokerToAnotherRevoker() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        lsp8Revokable.grantRole(revokerRole, revoker1);
        lsp8Revokable.grantRole(revokerRole, revoker2);
        _mintTo(user1, tokenId1);

        vm.prank(revoker1);
        lsp8Revokable.revoke(user1, revoker2, tokenId1, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(revoker2), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId1), revoker2);
    }

    function test_RevokeAsDelegatedRevokerToSelf() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        lsp8Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, tokenId1);

        vm.prank(revoker1);
        lsp8Revokable.revoke(user1, revoker1, tokenId1, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(revoker1), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId1), revoker1);
    }

    function test_RevokeFailsForNonRevoker() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        _mintTo(user1, tokenId1);

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                nonOwner,
                revokerRole
            )
        );
        lsp8Revokable.revoke(user1, owner, tokenId1, "");
    }

    function test_RevokeFailsWhenDestinationHasNoRevokerRole() public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        lsp8Revokable.grantRole(revokerRole, revoker1);
        _mintTo(user1, tokenId1);

        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user2,
                revokerRole
            )
        );
        lsp8Revokable.revoke(user1, user2, tokenId1, "");
    }

    function test_RevokeFailsForWrongFrom() public {
        _mintTo(user1, tokenId1);

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8NotTokenOwner.selector,
                user1,
                tokenId1,
                user2
            )
        );
        lsp8Revokable.revoke(user2, owner, tokenId1, "");
    }

    function test_RevokeFailsForNonExistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(LSP8NonExistentTokenId.selector, tokenId4)
        );
        lsp8Revokable.revoke(user1, owner, tokenId4, "");
    }

    function test_TransferOwnershipClearsRevokerListAndRequiresNewOwnerToGrantRole()
        public
    {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();
        address newOwner = vm.addr(200);

        lsp8Revokable.grantRole(revokerRole, revoker1);
        lsp8Revokable.grantRole(revokerRole, revoker2);
        _mintTo(user1, tokenId1);

        lsp8Revokable.transferOwnership(newOwner);

        assertFalse(lsp8Revokable.hasRole(revokerRole, owner));
        assertFalse(lsp8Revokable.hasRole(revokerRole, revoker1));
        assertFalse(lsp8Revokable.hasRole(revokerRole, revoker2));
        assertTrue(lsp8Revokable.hasRole(DEFAULT_ADMIN_ROLE, newOwner));

        vm.prank(revoker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                revoker1,
                revokerRole
            )
        );
        lsp8Revokable.revoke(user1, newOwner, tokenId1, "");

        vm.prank(newOwner);
        lsp8Revokable.grantRole(revokerRole, newOwner);

        vm.prank(newOwner);
        lsp8Revokable.revoke(user1, newOwner, tokenId1, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(newOwner), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId1), newOwner);
    }

    function testFuzz_DelegatedRevokerCanRevoke(address delegatedRevoker) public {
        bytes32 revokerRole = lsp8Revokable.REVOKER_ROLE();

        vm.assume(delegatedRevoker != owner);
        vm.assume(delegatedRevoker != address(0));
        vm.assume(delegatedRevoker != user1);
        vm.assume(uint160(delegatedRevoker) > 10);

        lsp8Revokable.grantRole(revokerRole, delegatedRevoker);
        _mintTo(user1, tokenId2);

        vm.prank(delegatedRevoker);
        lsp8Revokable.revoke(user1, delegatedRevoker, tokenId2, "");

        assertEq(lsp8Revokable.balanceOf(user1), 0);
        assertEq(lsp8Revokable.balanceOf(delegatedRevoker), 1);
        assertEq(lsp8Revokable.tokenOwnerOf(tokenId2), delegatedRevoker);
    }

    function _mintTo(address to, bytes32 tokenId) internal {
        lsp8Revokable.mint(to, tokenId, true, "");
    }
}
