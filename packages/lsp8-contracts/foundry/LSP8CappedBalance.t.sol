// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import {Test} from "forge-std/Test.sol";

// interfaces
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";

// modules
import {
    LSP8CappedBalanceAbstract
} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// errors
import {
    AccessControlUnauthorizedAccount
} from "../contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol";
import {
    LSP8CappedBalanceExceeded
} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceErrors.sol";

// constants
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8CappedBalanceAbstract functionality
contract MockLSP8CappedBalance is LSP8CappedBalanceAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenBalanceCap_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8CappedBalanceAbstract(tokenBalanceCap_)
    {}

    // Helper function to mint tokens for testing
    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    // Helper function to burn tokens for testing
    function burn(bytes32 tokenId, bytes memory data) public {
        _burn(tokenId, data);
    }
}

contract LSP8CappedBalanceTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;
    uint256 tokenBalanceCap = 3; // Max 3 NFTs per address

    address owner = address(this);
    address nonOwner = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address zeroAddress = address(0);

    bytes32 constant UNCAPPED_BALANCE_ROLE =
        0x975773d1e0a917a74b57f36a377f439ffff6271648aebdbff75a52ab58eb7bad;

    MockLSP8CappedBalance lsp8CappedBalance;

    function setUp() public {
        lsp8CappedBalance = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            tokenBalanceCap
        );
    }

    function _mintTokenIds(
        MockLSP8CappedBalance token,
        address to,
        uint256 startTokenId,
        uint256 count
    ) internal {
        for (uint256 i = 0; i < count; i++) {
            token.mint(to, bytes32(startTokenId + i), true, "");
        }
    }

    // Test constructor initialization
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            lsp8CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set correctly"
        );
        assertTrue(
            lsp8CappedBalance.hasRole(UNCAPPED_BALANCE_ROLE, owner),
            "Owner should have UNCAPPED_BALANCE_ROLE"
        );
    }

    function test_DeployWithoutCappedBalanceFeatureDoesNotGrantUncappedRoleToOwner()
        public
    {
        address contractOwner = makeAddr("contractOwner");

        MockLSP8CappedBalance tokenContract = new MockLSP8CappedBalance(
            name,
            symbol,
            contractOwner,
            tokenType,
            tokenIdFormat,
            0 // tokenBalanceCap disabled
        );

        assertFalse(
            tokenContract.hasRole(
                tokenContract.UNCAPPED_BALANCE_ROLE(),
                contractOwner
            )
        );
        assertTrue(
            tokenContract.hasRole(
                tokenContract.DEFAULT_ADMIN_ROLE(),
                contractOwner
            )
        );

        bytes32[] memory ownerRoles = tokenContract.rolesOf(contractOwner);
        assertEq(ownerRoles.length, 1);
        assertEq(ownerRoles[0], tokenContract.DEFAULT_ADMIN_ROLE());
    }

    function test_DeployWithCappedBalanceFeatureGrantsUncappedRoleToOwnerAndEmitsRoleGranted()
        public
    {
        address contractOwner = makeAddr("contractOwner");

        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleGranted(
            lsp8CappedBalance.UNCAPPED_BALANCE_ROLE(),
            contractOwner,
            address(this)
        );
        MockLSP8CappedBalance tokenContract = new MockLSP8CappedBalance(
            name,
            symbol,
            contractOwner,
            tokenType,
            tokenIdFormat,
            tokenBalanceCap
        );

        assertTrue(
            tokenContract.hasRole(
                tokenContract.UNCAPPED_BALANCE_ROLE(),
                contractOwner
            )
        );
        assertTrue(
            tokenContract.hasRole(
                tokenContract.DEFAULT_ADMIN_ROLE(),
                contractOwner
            )
        );

        bytes32[] memory ownerRoles = tokenContract.rolesOf(contractOwner);
        assertEq(ownerRoles.length, 2);
        assertEq(ownerRoles[0], tokenContract.DEFAULT_ADMIN_ROLE());
        assertEq(ownerRoles[1], tokenContract.UNCAPPED_BALANCE_ROLE());
    }

    // Test balance cap is returned correctly
    function test_TokenBalanceCapReturnsCorrectValue() public {
        assertEq(
            lsp8CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Should return correct balance cap"
        );
    }

    // Test minting up to cap succeeds
    function test_MintingUpToCapSucceeds() public {
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 1);

        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 2);

        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 3);
    }

    // Test minting exceeding cap reverts
    function test_MintingExceedingCapReverts() public {
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8CappedBalanceExceeded.selector,
                user1,
                3, // current balance
                tokenBalanceCap
            )
        );
        lsp8CappedBalance.mint(user1, bytes32(uint256(4)), true, "");
    }

    // Test balance cap enforced on transfers
    function test_TransferEnforcesBalanceCap() public {
        // Mint tokens to owner (UNCAPPED_BALANCE_ROLE holder, can exceed cap)
        lsp8CappedBalance.mint(owner, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(owner, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(owner, bytes32(uint256(3)), true, "");
        lsp8CappedBalance.mint(owner, bytes32(uint256(4)), true, "");

        // Transfer 3 tokens to user1 (should succeed, at cap)
        lsp8CappedBalance.transfer(owner, user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.transfer(owner, user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.transfer(owner, user1, bytes32(uint256(3)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 3);

        // Transfer 4th token to user1 (should fail, exceeds cap)
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8CappedBalanceExceeded.selector,
                user1,
                3,
                tokenBalanceCap
            )
        );
        lsp8CappedBalance.transfer(owner, user1, bytes32(uint256(4)), true, "");
    }

    // Test role holders bypass balance cap
    function test_UncappedRoleBypassesBalanceCap() public {
        lsp8CappedBalance.grantRole(UNCAPPED_BALANCE_ROLE, user1);

        // Mint more than cap to address with the bypass role
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(4)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(5)), true, "");

        assertEq(lsp8CappedBalance.balanceOf(user1), 5);
    }

    // Test cap=0 disables the limit
    function test_ZeroCapDisablesLimit() public {
        MockLSP8CappedBalance unlimitedToken = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0 // No cap
        );

        // Should be able to mint many tokens to a regular user
        for (uint256 i = 1; i <= 100; i++) {
            unlimitedToken.mint(user1, bytes32(i), true, "");
        }
        assertEq(unlimitedToken.balanceOf(user1), 100);
    }

    // Test burning always succeeds (not subject to cap)
    function test_BurningAlwaysSucceeds() public {
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");

        // Burning should work regardless of cap
        lsp8CappedBalance.burn(bytes32(uint256(1)), "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 2);

        // Can now mint again since under cap
        lsp8CappedBalance.mint(user1, bytes32(uint256(4)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 3);
    }

    // Test transfers between regular users
    function test_TransferBetweenRegularUsers() public {
        // Mint to user1
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");

        // Mint to user2
        lsp8CappedBalance.mint(user2, bytes32(uint256(3)), true, "");
        lsp8CappedBalance.mint(user2, bytes32(uint256(4)), true, "");
        lsp8CappedBalance.mint(user2, bytes32(uint256(5)), true, "");

        // user1 transfers to user2 (should fail, user2 at cap)
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8CappedBalanceExceeded.selector,
                user2,
                3,
                tokenBalanceCap
            )
        );
        lsp8CappedBalance.transfer(user1, user2, bytes32(uint256(1)), true, "");

        // user2 transfers to user1 (should succeed, user1 under cap)
        vm.prank(user2);
        lsp8CappedBalance.transfer(user2, user1, bytes32(uint256(3)), true, "");
        assertEq(lsp8CappedBalance.balanceOf(user1), 3);
        assertEq(lsp8CappedBalance.balanceOf(user2), 2);
    }

    // Test owner (UNCAPPED_BALANCE_ROLE holder) can receive unlimited
    function test_OwnerCanReceiveUnlimited() public {
        // Mint many tokens directly to owner
        for (uint256 i = 1; i <= 10; i++) {
            lsp8CappedBalance.mint(owner, bytes32(i), true, "");
        }
        assertEq(lsp8CappedBalance.balanceOf(owner), 10);
    }

    // Test revoking the bypass role enforces the cap again
    function test_RevokingUncappedRoleEnforcesCap() public {
        lsp8CappedBalance.grantRole(UNCAPPED_BALANCE_ROLE, user1);

        // Mint tokens exceeding cap
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(4)), true, "");

        lsp8CappedBalance.revokeRole(UNCAPPED_BALANCE_ROLE, user1);

        // Now user1 cannot receive more tokens via transfer
        lsp8CappedBalance.mint(owner, bytes32(uint256(5)), true, "");

        vm.expectRevert(
            abi.encodeWithSelector(
                LSP8CappedBalanceExceeded.selector,
                user1,
                4,
                tokenBalanceCap
            )
        );
        lsp8CappedBalance.transfer(owner, user1, bytes32(uint256(5)), true, "");
    }

    // Test transfer ownership
    function test_TransferOwnershipClearsUncappedBalanceRoleAdmin() public {
        bytes32 uncappedBalanceAdminRole = keccak256("UNCAPPED_ADMIN_ROLE");
        address uncappedBalanceAdmin = makeAddr("A Uncapped Balance Admin");

        lsp8CappedBalance.setRoleAdmin(
            UNCAPPED_BALANCE_ROLE,
            uncappedBalanceAdminRole
        );
        assertEq(
            lsp8CappedBalance.getRoleAdmin(UNCAPPED_BALANCE_ROLE),
            uncappedBalanceAdminRole
        );

        lsp8CappedBalance.grantRole(
            uncappedBalanceAdminRole,
            uncappedBalanceAdmin
        );
        assertTrue(
            lsp8CappedBalance.hasRole(
                uncappedBalanceAdminRole,
                uncappedBalanceAdmin
            )
        );

        vm.prank(uncappedBalanceAdmin);
        lsp8CappedBalance.grantRole(UNCAPPED_BALANCE_ROLE, address(11111));
        assertTrue(
            lsp8CappedBalance.hasRole(UNCAPPED_BALANCE_ROLE, address(11111))
        );

        lsp8CappedBalance.transferOwnership(vm.addr(200));

        assertEq(
            lsp8CappedBalance.getRoleAdmin(UNCAPPED_BALANCE_ROLE),
            lsp8CappedBalance.DEFAULT_ADMIN_ROLE()
        );

        // Test previous admin cannot use its role
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                uncappedBalanceAdmin,
                lsp8CappedBalance.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(uncappedBalanceAdmin);
        lsp8CappedBalance.grantRole(UNCAPPED_BALANCE_ROLE, address(22222));

        // Addresses with previously granted role still persist
        assertTrue(
            lsp8CappedBalance.hasRole(UNCAPPED_BALANCE_ROLE, address(11111))
        );
    }

    // ------ Fuzzing ------

    function testFuzz_MintAmountRespectsBalanceCap(
        uint8 cap,
        uint8 currentBalance,
        uint8 mintAmount
    ) public {
        uint256 boundedCap = bound(uint256(cap), 1, 50);
        uint256 boundedCurrentBalance = bound(
            uint256(currentBalance),
            0,
            boundedCap
        );
        uint256 boundedMintAmount = bound(uint256(mintAmount), 1, 50);

        MockLSP8CappedBalance token = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            boundedCap
        );

        _mintTokenIds(token, user1, 1, boundedCurrentBalance);

        uint256 availableCapacity = boundedCap - boundedCurrentBalance;

        if (boundedMintAmount > availableCapacity) {
            _mintTokenIds(token, user1, 1_000, availableCapacity);

            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP8CappedBalanceExceeded.selector,
                    user1,
                    boundedCap,
                    boundedCap
                )
            );
            token.mint(user1, bytes32(1_000 + availableCapacity), true, "");

            assertEq(token.balanceOf(user1), boundedCap);
            return;
        }

        _mintTokenIds(token, user1, 1_000, boundedMintAmount);
        assertEq(
            token.balanceOf(user1),
            boundedCurrentBalance + boundedMintAmount
        );
    }

    function testFuzz_TransferAmountRespectsBalanceCap(
        uint8 cap,
        uint8 currentBalance,
        uint8 transferAmount
    ) public {
        uint256 boundedCap = bound(uint256(cap), 1, 50);
        uint256 boundedCurrentBalance = bound(
            uint256(currentBalance),
            0,
            boundedCap
        );
        uint256 boundedTransferAmount = bound(uint256(transferAmount), 1, 50);

        MockLSP8CappedBalance token = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            boundedCap
        );

        _mintTokenIds(token, user1, 1, boundedCurrentBalance);
        _mintTokenIds(token, owner, 10_000, boundedTransferAmount);

        uint256 availableCapacity = boundedCap - boundedCurrentBalance;

        if (boundedTransferAmount > availableCapacity) {
            for (uint256 i = 0; i < availableCapacity; i++) {
                token.transfer(owner, user1, bytes32(10_000 + i), true, "");
            }

            vm.expectRevert(
                abi.encodeWithSelector(
                    LSP8CappedBalanceExceeded.selector,
                    user1,
                    boundedCap,
                    boundedCap
                )
            );
            token.transfer(
                owner,
                user1,
                bytes32(10_000 + availableCapacity),
                true,
                ""
            );

            assertEq(token.balanceOf(user1), boundedCap);
            return;
        }

        for (uint256 i = 0; i < boundedTransferAmount; i++) {
            token.transfer(owner, user1, bytes32(10_000 + i), true, "");
        }

        assertEq(
            token.balanceOf(user1),
            boundedCurrentBalance + boundedTransferAmount
        );
    }

    function testFuzz_BalanceCapEnforcement(uint8 cap, uint8 mintCount) public {
        vm.assume(cap > 0 && cap <= 100);
        vm.assume(mintCount > 0 && mintCount <= 100);

        MockLSP8CappedBalance token = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            cap
        );

        for (uint256 i = 1; i <= mintCount; i++) {
            if (i <= cap) {
                token.mint(user1, bytes32(i), true, "");
                assertEq(token.balanceOf(user1), i);
            } else {
                vm.expectRevert(
                    abi.encodeWithSelector(
                        LSP8CappedBalanceExceeded.selector,
                        user1,
                        cap,
                        cap
                    )
                );
                token.mint(user1, bytes32(i), true, "");
            }
        }
    }

    function testFuzz_UncappedRoleBypassesCap(uint8 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 50);

        address uncappedAddr = vm.addr(200);

        lsp8CappedBalance.grantRole(UNCAPPED_BALANCE_ROLE, uncappedAddr);

        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8CappedBalance.mint(
                uncappedAddr,
                bytes32(uint256(1000 + i)),
                true,
                ""
            );
        }

        assertEq(lsp8CappedBalance.balanceOf(uncappedAddr), mintCount);
    }

    function testFuzz_ZeroCapAllowsUnlimited(uint256 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 100);

        MockLSP8CappedBalance unlimitedToken = new MockLSP8CappedBalance(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0
        );

        for (uint256 i = 1; i <= mintCount; i++) {
            unlimitedToken.mint(user1, bytes32(i), true, "");
        }

        assertEq(unlimitedToken.balanceOf(user1), mintCount);
    }
}
