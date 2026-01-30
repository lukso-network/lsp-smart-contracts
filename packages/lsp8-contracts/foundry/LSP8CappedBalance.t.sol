// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8CappedBalanceAbstract} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol";
import {LSP8AllowlistAbstract} from "../contracts/extensions/LSP8Allowlist/LSP8AllowlistAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8CappedBalance} from "../contracts/extensions/LSP8CappedBalance/ILSP8CappedBalance.sol";
import {ILSP8Allowlist} from "../contracts/extensions/LSP8Allowlist/ILSP8Allowlist.sol";

// errors
import {LSP8CappedBalanceExceeded} from "../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
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
        LSP8AllowlistAbstract(newOwner_)
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

    // Test constructor initialization
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            lsp8CappedBalance.tokenBalanceCap(),
            tokenBalanceCap,
            "Balance cap should be set correctly"
        );
        assertTrue(
            lsp8CappedBalance.isAllowlisted(owner),
            "Owner should be allowlisted"
        );
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
        // Mint tokens to owner (allowlisted, can exceed cap)
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

    // Test allowlisted addresses bypass balance cap
    function test_AllowlistedBypassesBalanceCap() public {
        lsp8CappedBalance.addToAllowlist(user1);

        // Mint more than cap to allowlisted user
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

        // Should be able to mint many tokens to non-allowlisted user
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

    // Test transfers between non-allowlisted users
    function test_TransferBetweenNonAllowlistedUsers() public {
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

    // Test owner (allowlisted) can receive unlimited
    function test_OwnerCanReceiveUnlimited() public {
        // Mint many tokens directly to owner
        for (uint256 i = 1; i <= 10; i++) {
            lsp8CappedBalance.mint(owner, bytes32(i), true, "");
        }
        assertEq(lsp8CappedBalance.balanceOf(owner), 10);
    }

    // Test removing from allowlist enforces cap
    function test_RemovingFromAllowlistEnforcesCap() public {
        lsp8CappedBalance.addToAllowlist(user1);

        // Mint tokens exceeding cap
        lsp8CappedBalance.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(3)), true, "");
        lsp8CappedBalance.mint(user1, bytes32(uint256(4)), true, "");

        // Remove from allowlist
        lsp8CappedBalance.removeFromAllowlist(user1);

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

    // ------ Fuzzing ------

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

    function testFuzz_AllowlistedBypassesCap(uint8 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 50);

        address allowlistedAddr = vm.addr(200);

        lsp8CappedBalance.addToAllowlist(allowlistedAddr);

        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8CappedBalance.mint(
                allowlistedAddr,
                bytes32(uint256(1000 + i)),
                true,
                ""
            );
        }

        assertEq(lsp8CappedBalance.balanceOf(allowlistedAddr), mintCount);
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
