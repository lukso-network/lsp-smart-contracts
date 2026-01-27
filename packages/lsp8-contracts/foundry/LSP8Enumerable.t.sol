// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8Enumerable} from "../contracts/extensions/LSP8Enumerable.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";

// Mock contract to test LSP8Enumerable functionality
contract MockLSP8Enumerable is LSP8Enumerable {
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

contract LSP8EnumerableTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));
    bytes32 tokenId4 = bytes32(uint256(4));
    bytes32 tokenId5 = bytes32(uint256(5));

    MockLSP8Enumerable lsp8Enumerable;

    function setUp() public {
        lsp8Enumerable = new MockLSP8Enumerable(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat
        );
    }

    // Test tokenAt returns correct tokenId for valid indices
    function test_TokenAtReturnsCorrectTokenId() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user2, tokenId3, true, "");

        assertEq(
            lsp8Enumerable.tokenAt(0),
            tokenId1,
            "Token at index 0 should be tokenId1"
        );
        assertEq(
            lsp8Enumerable.tokenAt(1),
            tokenId2,
            "Token at index 1 should be tokenId2"
        );
        assertEq(
            lsp8Enumerable.tokenAt(2),
            tokenId3,
            "Token at index 2 should be tokenId3"
        );
    }

    // Test tokenAt returns bytes32(0) for invalid index
    function test_TokenAtReturnsZeroForInvalidIndex() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");

        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(
            lsp8Enumerable.tokenAt(1),
            bytes32(0),
            "Should return bytes32(0) for invalid index"
        );
        assertEq(
            lsp8Enumerable.tokenAt(999),
            bytes32(0),
            "Should return bytes32(0) for large invalid index"
        );
        // Verify totalSupply matches expected count
        assertEq(lsp8Enumerable.totalSupply(), 1, "Total supply should be 1");
        // Verify only valid indices return tokens
        assertTrue(
            lsp8Enumerable.tokenAt(0) != bytes32(0),
            "Valid index should return non-zero token"
        );
    }

    // Test enumeration maintains correct indices after minting
    function test_EnumerationMaintainsIndicesAfterMinting() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        assertEq(lsp8Enumerable.totalSupply(), 1);
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);

        lsp8Enumerable.mint(user1, tokenId2, true, "");
        assertEq(lsp8Enumerable.totalSupply(), 2);
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId2);

        lsp8Enumerable.mint(user2, tokenId3, true, "");
        assertEq(lsp8Enumerable.totalSupply(), 3);
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId2);
        assertEq(lsp8Enumerable.tokenAt(2), tokenId3);
    }

    // Test enumeration handles burning (swap-last-with-deleted pattern)
    function test_EnumerationHandlesBurning() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user1, tokenId3, true, "");

        // Burn the first token
        lsp8Enumerable.burn(tokenId1, "");

        assertEq(lsp8Enumerable.totalSupply(), 2);
        // The last token (tokenId3) should be swapped to index 0
        assertEq(
            lsp8Enumerable.tokenAt(0),
            tokenId3,
            "After burn, tokenId3 should be at index 0"
        );
        assertEq(
            lsp8Enumerable.tokenAt(1),
            tokenId2,
            "tokenId2 should remain at index 1"
        );
        assertEq(
            lsp8Enumerable.tokenAt(2),
            bytes32(0),
            "Index 2 should be empty"
        );
    }

    // Test no gaps in enumeration after burns
    function test_NoGapsAfterBurns() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user1, tokenId3, true, "");
        lsp8Enumerable.mint(user1, tokenId4, true, "");
        lsp8Enumerable.mint(user1, tokenId5, true, "");

        // Burn the middle token (tokenId3)
        lsp8Enumerable.burn(tokenId3, "");
        assertEq(lsp8Enumerable.totalSupply(), 4);

        // Verify all indices from 0 to totalSupply-1 have valid tokens
        for (uint256 i = 0; i < lsp8Enumerable.totalSupply(); i++) {
            assertTrue(
                lsp8Enumerable.tokenAt(i) != bytes32(0),
                "All indices should have valid tokens"
            );
        }
    }

    // Test burning last token
    function test_BurningLastToken() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user1, tokenId3, true, "");

        // Burn the last token
        lsp8Enumerable.burn(tokenId3, "");

        assertEq(lsp8Enumerable.totalSupply(), 2);
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId2);
        assertEq(lsp8Enumerable.tokenAt(2), bytes32(0));
    }

    // Test boundary conditions (index 0, last index)
    function test_BoundaryConditions() public {
        // Empty state
        assertEq(
            lsp8Enumerable.tokenAt(0),
            bytes32(0),
            "Index 0 should be empty initially"
        );

        // Mint single token
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        assertEq(
            lsp8Enumerable.tokenAt(0),
            tokenId1,
            "Index 0 should have tokenId1"
        );
        assertEq(
            lsp8Enumerable.tokenAt(1),
            bytes32(0),
            "Index 1 should be empty"
        );

        // Burn single token
        lsp8Enumerable.burn(tokenId1, "");
        assertEq(
            lsp8Enumerable.tokenAt(0),
            bytes32(0),
            "Index 0 should be empty after burn"
        );
    }

    // Test multiple burns
    function test_MultipleBurns() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user1, tokenId3, true, "");
        lsp8Enumerable.mint(user1, tokenId4, true, "");

        // Burn in order: tokenId2, tokenId1, tokenId4
        lsp8Enumerable.burn(tokenId2, "");
        assertEq(lsp8Enumerable.totalSupply(), 3);
        // tokenId4 should be swapped to tokenId2's old position (index 1)
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId4);
        assertEq(lsp8Enumerable.tokenAt(2), tokenId3);

        lsp8Enumerable.burn(tokenId1, "");
        assertEq(lsp8Enumerable.totalSupply(), 2);
        // tokenId3 should be swapped to tokenId1's old position (index 0)
        assertEq(lsp8Enumerable.tokenAt(0), tokenId3);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId4);

        lsp8Enumerable.burn(tokenId4, "");
        assertEq(lsp8Enumerable.totalSupply(), 1);
        assertEq(lsp8Enumerable.tokenAt(0), tokenId3);
    }

    // Test enumeration is preserved during transfers
    function test_TransfersDoNotAffectEnumeration() public {
        lsp8Enumerable.mint(user1, tokenId1, true, "");
        lsp8Enumerable.mint(user1, tokenId2, true, "");
        lsp8Enumerable.mint(user2, tokenId3, true, "");

        // Transfer tokenId1 from user1 to user2
        vm.prank(user1);
        lsp8Enumerable.transfer(user1, user2, tokenId1, true, "");

        // Enumeration should remain unchanged
        assertEq(lsp8Enumerable.tokenAt(0), tokenId1);
        assertEq(lsp8Enumerable.tokenAt(1), tokenId2);
        assertEq(lsp8Enumerable.tokenAt(2), tokenId3);
        assertEq(lsp8Enumerable.totalSupply(), 3);
    }

    // Test iterating through all tokens
    function test_IterateThroughAllTokens() public {
        bytes32[] memory expectedTokens = new bytes32[](5);
        expectedTokens[0] = tokenId1;
        expectedTokens[1] = tokenId2;
        expectedTokens[2] = tokenId3;
        expectedTokens[3] = tokenId4;
        expectedTokens[4] = tokenId5;

        for (uint256 i = 0; i < expectedTokens.length; i++) {
            lsp8Enumerable.mint(user1, expectedTokens[i], true, "");
        }

        for (uint256 i = 0; i < lsp8Enumerable.totalSupply(); i++) {
            assertEq(
                lsp8Enumerable.tokenAt(i),
                expectedTokens[i],
                "Token at index should match expected"
            );
        }
    }

    // ------ Fuzzing ------

    function testFuzz_EnumerationAfterMints(uint8 mintCount) public {
        vm.assume(mintCount > 0 && mintCount <= 50);

        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8Enumerable.mint(user1, bytes32(i), true, "");
        }

        assertEq(lsp8Enumerable.totalSupply(), mintCount);

        // Verify all tokens are accessible via enumeration
        for (uint256 i = 0; i < mintCount; i++) {
            assertEq(
                lsp8Enumerable.tokenAt(i),
                bytes32(i + 1),
                "Each index should have the correct token"
            );
        }
    }

    function testFuzz_EnumerationAfterBurns(
        uint8 mintCount,
        uint8 burnCount
    ) public {
        vm.assume(mintCount > 0 && mintCount <= 50);
        vm.assume(burnCount > 0 && burnCount <= mintCount);

        // Mint tokens
        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8Enumerable.mint(user1, bytes32(i), true, "");
        }

        // Burn tokens from the end
        for (uint256 i = 0; i < burnCount; i++) {
            bytes32 tokenToBurn = lsp8Enumerable.tokenAt(
                lsp8Enumerable.totalSupply() - 1
            );
            lsp8Enumerable.burn(tokenToBurn, "");
        }

        uint256 expectedSupply = mintCount - burnCount;
        assertEq(lsp8Enumerable.totalSupply(), expectedSupply);

        // Verify no gaps
        for (uint256 i = 0; i < expectedSupply; i++) {
            assertTrue(
                lsp8Enumerable.tokenAt(i) != bytes32(0),
                "All indices should have valid tokens"
            );
        }

        // Verify index beyond supply is empty
        assertEq(lsp8Enumerable.tokenAt(expectedSupply), bytes32(0));
    }

    function testFuzz_RandomBurns(uint256 seed) public {
        // Mint 10 tokens
        for (uint256 i = 1; i <= 10; i++) {
            lsp8Enumerable.mint(user1, bytes32(i), true, "");
        }

        // Burn a "random" selection based on seed
        uint256 burnMask = seed % 1024; // 10 bits for 10 tokens
        uint256 burnedCount = 0;

        for (uint256 i = 0; i < 10; i++) {
            if ((burnMask >> i) & 1 == 1) {
                // Find the token to burn by iterating through current enumeration
                bytes32 tokenToBurn = bytes32(i + 1);
                // Only burn if token exists
                try lsp8Enumerable.tokenOwnerOf(tokenToBurn) {
                    lsp8Enumerable.burn(tokenToBurn, "");
                    burnedCount++;
                } catch {
                    // Token already burned or doesn't exist
                }
            }
        }

        uint256 expectedSupply = 10 - burnedCount;
        assertEq(lsp8Enumerable.totalSupply(), expectedSupply);

        // Verify continuous enumeration (no gaps)
        for (uint256 i = 0; i < expectedSupply; i++) {
            assertTrue(
                lsp8Enumerable.tokenAt(i) != bytes32(0),
                "All remaining indices should have valid tokens"
            );
        }
    }
}
