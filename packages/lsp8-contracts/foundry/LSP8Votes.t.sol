// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.22;

// foundry
import "forge-std/Test.sol";

// modules
import {LSP8Votes} from "../contracts/extensions/LSP8Votes.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

// constants
import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../contracts/LSP8Constants.sol";
import {
    _TYPEID_LSP8_VOTESDELEGATOR,
    _TYPEID_LSP8_VOTESDELEGATEE
} from "../contracts/extensions/LSP8VotesConstants.sol";

// Mock contract to test LSP8Votes functionality
contract MockLSP8Votes is LSP8Votes {
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
        EIP712(name_, "1")
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

    // Expose clock function for testing (required by Votes)
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // Expose CLOCK_MODE for testing (required by Votes)
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}

contract LSP8VotesTest is Test {
    string name = "Test NFT";
    string symbol = "TNFT";
    uint256 tokenType = _LSP4_TOKEN_TYPE_NFT;
    uint256 tokenIdFormat = _LSP8_TOKENID_FORMAT_NUMBER;

    address owner = address(this);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address user3 = vm.addr(103);
    address delegatee = vm.addr(104);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));
    bytes32 tokenId3 = bytes32(uint256(3));
    bytes32 tokenId4 = bytes32(uint256(4));
    bytes32 tokenId5 = bytes32(uint256(5));

    MockLSP8Votes lsp8Votes;

    function setUp() public {
        lsp8Votes = new MockLSP8Votes(
            name,
            symbol,
            owner,
            tokenType,
            tokenIdFormat
        );
    }

    // Test initial state
    function test_InitialVotesAreZero() public {
        assertEq(lsp8Votes.getVotes(user1), 0);
        assertEq(lsp8Votes.getVotes(user2), 0);
    }

    // Test voting units equal balance
    function test_VotingUnitsEqualBalance() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");
        lsp8Votes.mint(user2, tokenId3, true, "");

        // Without delegation, votes are 0
        assertEq(lsp8Votes.getVotes(user1), 0);
        assertEq(lsp8Votes.getVotes(user2), 0);

        // After self-delegation, votes equal balance
        vm.prank(user1);
        lsp8Votes.delegate(user1);
        assertEq(lsp8Votes.getVotes(user1), 2);

        vm.prank(user2);
        lsp8Votes.delegate(user2);
        assertEq(lsp8Votes.getVotes(user2), 1);
    }

    // Test self-delegation
    function test_SelfDelegation() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");
        lsp8Votes.mint(user1, tokenId3, true, "");

        // Before delegation
        assertEq(lsp8Votes.getVotes(user1), 0);
        assertEq(lsp8Votes.delegates(user1), address(0));

        // Self-delegate
        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), 3);
        assertEq(lsp8Votes.delegates(user1), user1);
    }

    // Test delegation to another address
    function test_DelegationToOther() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        // User1 delegates to delegatee
        vm.prank(user1);
        lsp8Votes.delegate(delegatee);

        assertEq(lsp8Votes.getVotes(user1), 0);
        assertEq(lsp8Votes.getVotes(delegatee), 2);
        assertEq(lsp8Votes.delegates(user1), delegatee);
    }

    // Test votes transferred with token transfers
    function test_VotesTransferredWithTokens() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        // Both users self-delegate
        vm.prank(user1);
        lsp8Votes.delegate(user1);
        vm.prank(user2);
        lsp8Votes.delegate(user2);

        assertEq(lsp8Votes.getVotes(user1), 2);
        assertEq(lsp8Votes.getVotes(user2), 0);

        // Transfer one token
        vm.prank(user1);
        lsp8Votes.transfer(user1, user2, tokenId1, true, "");

        assertEq(lsp8Votes.getVotes(user1), 1);
        assertEq(lsp8Votes.getVotes(user2), 1);
    }

    // Test votes update on mint
    function test_VotesUpdateOnMint() public {
        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), 0);

        lsp8Votes.mint(user1, tokenId1, true, "");
        assertEq(lsp8Votes.getVotes(user1), 1);

        lsp8Votes.mint(user1, tokenId2, true, "");
        assertEq(lsp8Votes.getVotes(user1), 2);
    }

    // Test votes update on burn
    function test_VotesUpdateOnBurn() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), 2);

        lsp8Votes.burn(tokenId1, "");
        assertEq(lsp8Votes.getVotes(user1), 1);

        lsp8Votes.burn(tokenId2, "");
        assertEq(lsp8Votes.getVotes(user1), 0);
    }

    // Test changing delegation
    function test_ChangingDelegation() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        // First delegate to delegatee
        vm.prank(user1);
        lsp8Votes.delegate(delegatee);

        assertEq(lsp8Votes.getVotes(delegatee), 2);
        assertEq(lsp8Votes.getVotes(user2), 0);

        // Change delegation to user2
        vm.prank(user1);
        lsp8Votes.delegate(user2);

        assertEq(lsp8Votes.getVotes(delegatee), 0);
        assertEq(lsp8Votes.getVotes(user2), 2);
    }

    // Test multiple delegators to same delegatee
    function test_MultipleDelegatorsToSameDelegatee() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");
        lsp8Votes.mint(user2, tokenId3, true, "");
        lsp8Votes.mint(user3, tokenId4, true, "");

        // All users delegate to delegatee
        vm.prank(user1);
        lsp8Votes.delegate(delegatee);
        vm.prank(user2);
        lsp8Votes.delegate(delegatee);
        vm.prank(user3);
        lsp8Votes.delegate(delegatee);

        assertEq(lsp8Votes.getVotes(delegatee), 4);
        assertEq(lsp8Votes.getVotes(user1), 0);
        assertEq(lsp8Votes.getVotes(user2), 0);
        assertEq(lsp8Votes.getVotes(user3), 0);
    }

    // Test delegation with zero balance
    function test_DelegationWithZeroBalance() public {
        // User1 has no tokens but can still delegate
        vm.prank(user1);
        lsp8Votes.delegate(delegatee);

        assertEq(lsp8Votes.delegates(user1), delegatee);
        assertEq(lsp8Votes.getVotes(delegatee), 0);

        // Mint tokens after delegation
        lsp8Votes.mint(user1, tokenId1, true, "");
        assertEq(lsp8Votes.getVotes(delegatee), 1);
    }

    // Test transfer from delegated to non-delegated
    function test_TransferFromDelegatedToNonDelegated() public {
        lsp8Votes.mint(user1, tokenId1, true, "");

        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), 1);
        assertEq(lsp8Votes.getVotes(user2), 0);

        // Transfer to user2 who hasn't delegated
        vm.prank(user1);
        lsp8Votes.transfer(user1, user2, tokenId1, true, "");

        assertEq(lsp8Votes.getVotes(user1), 0);
        // user2 has tokens but no votes (no delegation)
        assertEq(lsp8Votes.getVotes(user2), 0);
        assertEq(lsp8Votes.balanceOf(user2), 1);
    }

    // Test DelegateChanged event
    function test_DelegateChangedEvent() public {
        lsp8Votes.mint(user1, tokenId1, true, "");

        vm.expectEmit(true, true, true, true);
        emit IVotes.DelegateChanged(user1, address(0), delegatee);

        vm.prank(user1);
        lsp8Votes.delegate(delegatee);
    }

    // Test DelegateVotesChanged event
    function test_DelegateVotesChangedEvent() public {
        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        vm.expectEmit(true, false, false, true);
        emit IVotes.DelegateVotesChanged(delegatee, 0, 2);

        vm.prank(user1);
        lsp8Votes.delegate(delegatee);
    }

    // Test vote checkpointing
    function test_VoteCheckpointing() public {
        // Start at a specific time
        vm.warp(1000);

        lsp8Votes.mint(user1, tokenId1, true, "");

        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), 1);

        // Move forward in time and mint more (creates new checkpoint)
        vm.warp(2000);
        lsp8Votes.mint(user1, tokenId2, true, "");

        assertEq(lsp8Votes.getVotes(user1), 2);

        // Move forward again to be able to query past votes
        vm.warp(3000);

        // Check past votes at timestamp 1000 (should be 1, before second mint at 2000)
        assertEq(lsp8Votes.getPastVotes(user1, 1000), 1);
    }

    // Test total supply checkpointing
    function test_TotalSupplyCheckpointing() public {
        // Start at a specific time
        vm.warp(1000);

        lsp8Votes.mint(user1, tokenId1, true, "");

        // Move forward in time and mint more (creates new checkpoint)
        vm.warp(2000);
        lsp8Votes.mint(user1, tokenId2, true, "");

        // Move forward again to be able to query past supply
        vm.warp(3000);

        // Check past total supply at timestamp 1000 (should be 1, before second mint at 2000)
        assertEq(lsp8Votes.getPastTotalSupply(1000), 1);
        assertEq(lsp8Votes.totalSupply(), 2);
    }

    // ------ Fuzzing ------

    function testFuzz_VotesEqualBalanceAfterDelegation(
        uint8 tokenCount
    ) public {
        vm.assume(tokenCount > 0 && tokenCount <= 50);

        for (uint256 i = 1; i <= tokenCount; i++) {
            lsp8Votes.mint(user1, bytes32(i), true, "");
        }

        assertEq(lsp8Votes.getVotes(user1), 0);

        vm.prank(user1);
        lsp8Votes.delegate(user1);

        assertEq(lsp8Votes.getVotes(user1), tokenCount);
    }

    function testFuzz_VotesTransferCorrectly(
        uint8 mintCount,
        uint8 transferCount
    ) public {
        vm.assume(mintCount > 0 && mintCount <= 20);
        vm.assume(transferCount > 0 && transferCount <= mintCount);

        // Mint tokens to user1
        for (uint256 i = 1; i <= mintCount; i++) {
            lsp8Votes.mint(user1, bytes32(i), true, "");
        }

        // Both users delegate to themselves
        vm.prank(user1);
        lsp8Votes.delegate(user1);
        vm.prank(user2);
        lsp8Votes.delegate(user2);

        assertEq(lsp8Votes.getVotes(user1), mintCount);
        assertEq(lsp8Votes.getVotes(user2), 0);

        // Transfer some tokens
        for (uint256 i = 1; i <= transferCount; i++) {
            vm.prank(user1);
            lsp8Votes.transfer(user1, user2, bytes32(i), true, "");
        }

        assertEq(lsp8Votes.getVotes(user1), mintCount - transferCount);
        assertEq(lsp8Votes.getVotes(user2), transferCount);
    }

    function testFuzz_DelegationChanges(
        uint128 firstDelegateeSeed,
        uint128 secondDelegateeSeed
    ) public {
        vm.assume(firstDelegateeSeed > 10); // Avoid precompile addresses
        vm.assume(secondDelegateeSeed > 10);
        vm.assume(firstDelegateeSeed != secondDelegateeSeed);

        address firstDelegatee = vm.addr(uint256(firstDelegateeSeed));
        address secondDelegatee = vm.addr(uint256(secondDelegateeSeed));

        lsp8Votes.mint(user1, tokenId1, true, "");
        lsp8Votes.mint(user1, tokenId2, true, "");

        // First delegation
        vm.prank(user1);
        lsp8Votes.delegate(firstDelegatee);
        assertEq(lsp8Votes.getVotes(firstDelegatee), 2);

        // Change delegation
        vm.prank(user1);
        lsp8Votes.delegate(secondDelegatee);
        assertEq(lsp8Votes.getVotes(firstDelegatee), 0);
        assertEq(lsp8Votes.getVotes(secondDelegatee), 2);
    }
}

// Interface for Votes events
interface IVotes {
    event DelegateChanged(
        address indexed delegator,
        address indexed fromDelegate,
        address indexed toDelegate
    );
    event DelegateVotesChanged(
        address indexed delegate,
        uint256 previousVotes,
        uint256 newVotes
    );
}
