// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8CappedSupplyAbstract} from "../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8CappedSupply} from "../contracts/extensions/LSP8CappedSupply/ILSP8CappedSupply.sol";

// errors
import {LSP8CappedSupplyCannotMintOverCap} from "../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyErrors.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8CappedSupplyAbstract functionality
contract MockLSP8CappedSupply is LSP8CappedSupplyAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        LSP8CappedSupplyAbstract(tokenSupplyCap_)
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

contract LSP8CappedSupplyTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;
    uint256 tokenSupplyCap = 10; // Max 10 total NFTs

    address owner = address(this);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);

    MockLSP8CappedSupply lsp8CappedSupply;

    function setUp() public {
        lsp8CappedSupply = new MockLSP8CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            tokenSupplyCap
        );
    }

    // Test constructor initialization
    function test_ConstructorInitializesCorrectly() public {
        assertEq(
            lsp8CappedSupply.tokenSupplyCap(),
            tokenSupplyCap,
            "Supply cap should be set correctly"
        );
        assertEq(
            lsp8CappedSupply.totalSupply(),
            0,
            "Initial supply should be 0"
        );
    }

    // Test tokenSupplyCap returns correct value
    function test_TokenSupplyCapReturnsCorrectValue() public {
        assertEq(
            lsp8CappedSupply.tokenSupplyCap(),
            tokenSupplyCap,
            "Should return correct supply cap"
        );
    }

    // Test minting up to cap succeeds
    function test_MintingUpToCapSucceeds() public {
        for (uint256 i = 1; i <= tokenSupplyCap; i++) {
            lsp8CappedSupply.mint(user1, bytes32(i), true, "");
        }
        assertEq(
            lsp8CappedSupply.totalSupply(),
            tokenSupplyCap,
            "Total supply should equal cap"
        );
    }

    // Test exceeding cap reverts
    function test_MintingExceedingCapReverts() public {
        // Mint up to cap
        for (uint256 i = 1; i <= tokenSupplyCap; i++) {
            lsp8CappedSupply.mint(user1, bytes32(i), true, "");
        }

        // Try to mint one more
        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        lsp8CappedSupply.mint(
            user1,
            bytes32(uint256(tokenSupplyCap + 1)),
            true,
            ""
        );
    }

    // Test cap=0 disables the limit
    function test_ZeroCapDisablesLimit() public {
        MockLSP8CappedSupply unlimitedToken = new MockLSP8CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            0 // No cap
        );

        // Should be able to mint many tokens
        for (uint256 i = 1; i <= 1000; i++) {
            unlimitedToken.mint(user1, bytes32(i), true, "");
        }
        assertEq(unlimitedToken.totalSupply(), 1000);
    }

    // Test burning allows re-minting
    function test_BurningAllowsReminting() public {
        // Mint up to cap
        for (uint256 i = 1; i <= tokenSupplyCap; i++) {
            lsp8CappedSupply.mint(user1, bytes32(i), true, "");
        }
        assertEq(lsp8CappedSupply.totalSupply(), tokenSupplyCap);

        // Cannot mint more
        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        lsp8CappedSupply.mint(user1, bytes32(uint256(100)), true, "");

        // Burn one token
        lsp8CappedSupply.burn(bytes32(uint256(1)), "");
        assertEq(lsp8CappedSupply.totalSupply(), tokenSupplyCap - 1);

        // Now can mint one more
        lsp8CappedSupply.mint(user2, bytes32(uint256(100)), true, "");
        assertEq(lsp8CappedSupply.totalSupply(), tokenSupplyCap);
    }

    // Test minting to different addresses
    function test_MintingToDifferentAddresses() public {
        // Mint tokens to different users
        lsp8CappedSupply.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedSupply.mint(user2, bytes32(uint256(2)), true, "");
        lsp8CappedSupply.mint(owner, bytes32(uint256(3)), true, "");

        assertEq(lsp8CappedSupply.balanceOf(user1), 1);
        assertEq(lsp8CappedSupply.balanceOf(user2), 1);
        assertEq(lsp8CappedSupply.balanceOf(owner), 1);
        assertEq(lsp8CappedSupply.totalSupply(), 3);
    }

    // Test supply cap is immutable
    function test_SupplyCapIsImmutable() public {
        // Create two tokens with different caps
        MockLSP8CappedSupply token1 = new MockLSP8CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            5
        );

        MockLSP8CappedSupply token2 = new MockLSP8CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            100
        );

        assertEq(token1.tokenSupplyCap(), 5);
        assertEq(token2.tokenSupplyCap(), 100);

        // Mint up to token1's cap
        for (uint256 i = 1; i <= 5; i++) {
            token1.mint(user1, bytes32(i), true, "");
        }

        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        token1.mint(user1, bytes32(uint256(6)), true, "");

        // token2 can still mint
        for (uint256 i = 1; i <= 100; i++) {
            token2.mint(user1, bytes32(i), true, "");
        }
    }

    // Test total supply tracking with burns
    function test_TotalSupplyTrackingWithBurns() public {
        lsp8CappedSupply.mint(user1, bytes32(uint256(1)), true, "");
        lsp8CappedSupply.mint(user1, bytes32(uint256(2)), true, "");
        lsp8CappedSupply.mint(user2, bytes32(uint256(3)), true, "");
        assertEq(lsp8CappedSupply.totalSupply(), 3);

        lsp8CappedSupply.burn(bytes32(uint256(2)), "");
        assertEq(lsp8CappedSupply.totalSupply(), 2);

        lsp8CappedSupply.burn(bytes32(uint256(1)), "");
        assertEq(lsp8CappedSupply.totalSupply(), 1);

        lsp8CappedSupply.burn(bytes32(uint256(3)), "");
        assertEq(lsp8CappedSupply.totalSupply(), 0);
    }

    // Test cap boundary condition
    function test_CapBoundaryCondition() public {
        // Mint to cap - 1
        for (uint256 i = 1; i < tokenSupplyCap; i++) {
            lsp8CappedSupply.mint(user1, bytes32(i), true, "");
        }
        assertEq(lsp8CappedSupply.totalSupply(), tokenSupplyCap - 1);

        // Mint exactly at cap
        lsp8CappedSupply.mint(user1, bytes32(tokenSupplyCap), true, "");
        assertEq(lsp8CappedSupply.totalSupply(), tokenSupplyCap);

        // Fail at cap + 1
        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        lsp8CappedSupply.mint(
            user1,
            bytes32(uint256(tokenSupplyCap + 1)),
            true,
            ""
        );
    }

    // ------ Fuzzing ------

    function testFuzz_SupplyCapEnforcement(uint8 cap, uint8 mintCount) public {
        vm.assume(cap > 0 && cap <= 100);
        vm.assume(mintCount > 0 && mintCount <= 150);

        MockLSP8CappedSupply token = new MockLSP8CappedSupply(
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
                assertEq(token.totalSupply(), i);
            } else {
                vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
                token.mint(user1, bytes32(i), true, "");
            }
        }
    }

    function testFuzz_ZeroCapAllowsUnlimited(uint256 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 500);

        MockLSP8CappedSupply unlimitedToken = new MockLSP8CappedSupply(
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

        assertEq(unlimitedToken.totalSupply(), mintCount);
    }

    function testFuzz_BurnAndRemint(uint8 cap, uint8 burnCount) public {
        vm.assume(cap > 0 && cap <= 50);
        vm.assume(burnCount > 0 && burnCount <= cap);

        MockLSP8CappedSupply token = new MockLSP8CappedSupply(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat,
            cap
        );

        // Mint to cap
        for (uint256 i = 1; i <= cap; i++) {
            token.mint(user1, bytes32(i), true, "");
        }

        // Burn some tokens
        for (uint256 i = 1; i <= burnCount; i++) {
            token.burn(bytes32(i), "");
        }

        assertEq(token.totalSupply(), cap - burnCount);

        // Should be able to mint burnCount more
        for (uint256 i = 0; i < burnCount; i++) {
            token.mint(user2, bytes32(uint256(1000 + i)), true, "");
        }

        assertEq(token.totalSupply(), cap);

        // Cannot mint more
        vm.expectRevert(LSP8CappedSupplyCannotMintOverCap.selector);
        token.mint(user2, bytes32(uint256(9999)), true, "");
    }
}
