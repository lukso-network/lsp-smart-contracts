// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

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

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

contract MockLSP8RevokableInit is LSP8RevokableInitAbstract {
    function initialize(address newOwner_) external initializer {
        __LSP8Revokable_init(
            "Revokable NFT",
            "RNFT",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
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
            (owner)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        token = MockLSP8RevokableInit(payable(address(proxy)));
    }

    function test_InitializeSetsOwnerAndRevokerRole() public {
        bytes32 revokerRole = token.REVOKER_ROLE();

        assertEq(token.owner(), owner);
        assertTrue(token.hasRole(DEFAULT_ADMIN_ROLE, owner));
        assertTrue(token.hasRole(revokerRole, owner));
        assertEq(token.getRoleMemberCount(revokerRole), 1);
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
}
