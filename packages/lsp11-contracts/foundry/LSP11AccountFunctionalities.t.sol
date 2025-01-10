// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP11SocialRecovery} from "../contracts/LSP11SocialRecovery.sol";
import {ILSP11SocialRecovery} from "../contracts/ILSP11SocialRecovery.sol";
import {
    ILSP25ExecuteRelayCall
} from "@lukso/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol";
import "../contracts/LSP11Errors.sol";
import {_INTERFACEID_LSP11} from "../contracts/LSP11Constants.sol";

contract LSP11AccountFunctionalities is Test {
    LSP11SocialRecovery public lsp11;

    fallback() external payable {}

    receive() external payable {}

    function setUp() public {
        lsp11 = new LSP11SocialRecovery();
    }

    function testAddGuardian() public {
        address newGuardian = address(0xABC);

        // Call addGuardian
        lsp11.addGuardian(address(this), newGuardian);

        // Check if newGuardian is added
        assertTrue(lsp11.isGuardianOf(address(this), newGuardian));

        // Check getGuardiansOf
        address[] memory guardians = lsp11.getGuardiansOf(address(this));
        assertTrue(guardians.length == 1 && guardians[0] == newGuardian);
    }

    function testAddGuardianWithDifferentAccountShouldRevert() public {
        address newGuardian = address(0xABC);
        address differentAccount = address(0xDEF);

        // Expect a revert when trying to add a guardian with a different account parameter
        vm.expectRevert();
        lsp11.addGuardian(differentAccount, newGuardian);
    }

    function testAddExistingGuardianShouldRevert() public {
        address existingGuardian = address(0xABC);

        // First, add the guardian
        lsp11.addGuardian(address(this), existingGuardian);

        // Expect a revert when trying to add the same guardian again
        vm.expectRevert();
        lsp11.addGuardian(address(this), existingGuardian);
    }

    function testRemoveNonExistentGuardianShouldRevert() public {
        address nonExistentGuardian = address(0xABC);

        // Expect a revert when trying to remove a guardian that does not exist
        vm.expectRevert();
        lsp11.removeGuardian(address(this), nonExistentGuardian);
    }

    function testRemoveExistingGuardian() public {
        address existingGuardian = address(0xABC);

        // Add a guardian first
        lsp11.addGuardian(address(this), existingGuardian);

        // Remove the guardian
        lsp11.removeGuardian(address(this), existingGuardian);

        // Check if existingGuardian is removed
        assertFalse(lsp11.isGuardianOf(address(this), existingGuardian));

        // Check getGuardiansOf
        address[] memory guardians = lsp11.getGuardiansOf(address(this));
        assertTrue(guardians.length == 0);
    }

    function testRemoveGuardianWithDifferentAccountShouldRevert() public {
        address existingGuardian = address(0xABC);
        address differentAccount = address(0xDEF);

        // First, add the guardian to the test account
        lsp11.addGuardian(address(this), existingGuardian);

        // Expect a revert when trying to remove a guardian from a different account
        vm.expectRevert();
        lsp11.removeGuardian(differentAccount, existingGuardian);
    }

    function testRemoveGuardianWhenThresholdEqualsGuardiansShouldRevert()
        public
    {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);

        // Add two guardians
        lsp11.addGuardian(address(this), guardian1);
        lsp11.addGuardian(address(this), guardian2);

        // Set the guardian threshold to the current number of guardians (2 in this case)
        lsp11.setGuardiansThreshold(address(this), 2);

        // Expect a revert when trying to remove a guardian, since it would violate the threshold
        vm.expectRevert();
        lsp11.removeGuardian(address(this), guardian1);
    }

    function testAddGuardiansThreshold() public {
        uint256 newThreshold = 1;
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);

        // Add two guardians
        lsp11.addGuardian(address(this), guardian1);
        lsp11.addGuardian(address(this), guardian2);

        // Set the guardians threshold
        lsp11.setGuardiansThreshold(address(this), newThreshold);

        // Verify the guardians threshold is updated in the contract's state
        uint256 storedThreshold = lsp11.getGuardiansThresholdOf(address(this));
        assertEq(storedThreshold, newThreshold);
    }

    function testSetGuardiansThresholdWithDifferentAccountShouldRevert()
        public
    {
        address differentAccount = address(0xDEF);
        uint256 newThreshold = 2;

        // Expect a revert when trying to set the guardian threshold for a different account
        vm.expectRevert();
        lsp11.setGuardiansThreshold(differentAccount, newThreshold);
    }

    function testSetGuardiansThresholdHigherThanGuardiansShouldRevert() public {
        address guardian1 = address(0xABC);

        // Add a single guardian
        lsp11.addGuardian(address(this), guardian1);

        uint256 newThreshold = 2; // Setting threshold higher than the number of guardians (1 in this case)

        // Expect a revert when trying to set a threshold higher than the number of guardians
        vm.expectRevert();
        lsp11.setGuardiansThreshold(address(this), newThreshold);
    }

    function testAddSecretHash() public {
        bytes32 newSecretHash = keccak256("newSecret");

        // Set the secret hash
        lsp11.setRecoverySecretHash(address(this), newSecretHash);

        // Verify the secret hash is updated in the contract's state
        bytes32 storedSecretHash = lsp11.getSecretHashOf(address(this));
        assertEq(storedSecretHash, newSecretHash);
    }

    function testAddRecoveryDelay() public {
        uint256 newRecoveryDelay = 3600; // Example delay of 1 hour

        // Set the recovery delay
        lsp11.setRecoveryDelay(address(this), newRecoveryDelay);

        // Verify the recovery delay is updated in the contract's state
        uint256 storedRecoveryDelay = lsp11.getRecoveryDelayOf(address(this));
        assertEq(storedRecoveryDelay, newRecoveryDelay);
    }

    function testSetRecoverySecretHashWithDifferentAccountShouldRevert()
        public
    {
        address differentAccount = address(0xDEF);
        bytes32 newSecretHash = keccak256("newSecret");

        // Expect a revert when trying to set the recovery secret hash for a different account
        vm.expectRevert();
        lsp11.setRecoverySecretHash(differentAccount, newSecretHash);
    }

    function testSetRecoveryDelayWithDifferentAccountShouldRevert() public {
        address differentAccount = address(0xDEF);
        uint256 newRecoveryDelay = 3600; // Example delay of 1 hour

        // Expect a revert when trying to set the recovery delay for a different account
        vm.expectRevert();
        lsp11.setRecoveryDelay(differentAccount, newRecoveryDelay);
    }

    function testCancelRecoveryIncrementsCounter() public {
        // First, check the initial recovery counter value
        uint256 initialCounter = lsp11.getRecoveryCounterOf(address(this));

        // Call cancelRecoveryProcess
        lsp11.cancelRecoveryProcess(address(this));

        // Verify the recovery counter is incremented
        uint256 newCounter = lsp11.getRecoveryCounterOf(address(this));
        assertEq(newCounter, initialCounter + 1);
    }

    function testCancelRecoveryFromDifferentAccountShouldRevert() public {
        address differentAccount = address(0xDEF);

        // Expect a revert when trying to cancel recovery from a different account
        vm.expectRevert();
        lsp11.cancelRecoveryProcess(differentAccount);
    }

    function testBatchCallMultipleOperations() public {
        address newGuardian = address(0xABC);
        uint256 newThreshold = 1;
        bytes32 newSecretHash = keccak256("newSecret");
        uint256 newRecoveryDelay = 3600; // 1 hour

        // Prepare calldata for addGuardian
        bytes memory addGuardianData = abi.encodeWithSelector(
            LSP11SocialRecovery.addGuardian.selector,
            address(this),
            newGuardian
        );

        // Prepare calldata for setGuardiansThreshold
        bytes memory setThresholdData = abi.encodeWithSelector(
            LSP11SocialRecovery.setGuardiansThreshold.selector,
            address(this),
            newThreshold
        );

        // Prepare calldata for setRecoverySecretHash
        bytes memory setSecretData = abi.encodeWithSelector(
            LSP11SocialRecovery.setRecoverySecretHash.selector,
            address(this),
            newSecretHash
        );

        // Prepare calldata for setRecoveryDelay
        bytes memory setDelayData = abi.encodeWithSelector(
            LSP11SocialRecovery.setRecoveryDelay.selector,
            address(this),
            newRecoveryDelay
        );

        bytes[] memory calls = new bytes[](4);
        calls[0] = addGuardianData;
        calls[1] = setThresholdData;
        calls[2] = setSecretData;
        calls[3] = setDelayData;

        // Batch call
        lsp11.batchCalls(calls);

        // Verify each operation
        assertTrue(lsp11.isGuardianOf(address(this), newGuardian));
        assertEq(lsp11.getGuardiansThresholdOf(address(this)), newThreshold);
        assertEq(lsp11.getSecretHashOf(address(this)), newSecretHash);
        assertEq(lsp11.getRecoveryDelayOf(address(this)), newRecoveryDelay);
    }

    function testBatchCallMultipleOperationsOneFailTheWholeCall() public {
        address newGuardian = address(0xABC);

        // Setting the threshold to 3 will make the setGuardiansThreshold call fail
        // as its value is higher than the number of guardians
        uint256 newThreshold = 3;
        bytes32 newSecretHash = keccak256("newSecret");
        uint256 newRecoveryDelay = 3600; // 1 hour

        // Prepare calldata for addGuardian
        bytes memory addGuardianData = abi.encodeWithSelector(
            LSP11SocialRecovery.addGuardian.selector,
            address(this),
            newGuardian
        );

        // Prepare calldata for setGuardiansThreshold
        bytes memory setThresholdData = abi.encodeWithSelector(
            LSP11SocialRecovery.setGuardiansThreshold.selector,
            address(this),
            newThreshold
        );

        // Prepare calldata for setRecoverySecretHash
        bytes memory setSecretData = abi.encodeWithSelector(
            LSP11SocialRecovery.setRecoverySecretHash.selector,
            address(this),
            newSecretHash
        );

        // Prepare calldata for setRecoveryDelay
        bytes memory setDelayData = abi.encodeWithSelector(
            LSP11SocialRecovery.setRecoveryDelay.selector,
            address(this),
            newRecoveryDelay
        );

        bytes[] memory calls = new bytes[](4);
        calls[0] = addGuardianData;
        calls[1] = setThresholdData;
        calls[2] = setSecretData;
        calls[3] = setDelayData;

        // Batch call
        vm.expectRevert();
        lsp11.batchCalls(calls);
    }

    function testNonGuardianCannotVote() public {
        address nonGuardian = address(0xABC);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address guardianVotedAddress = address(0xDEF);

        // Add a guardian (different from nonGuardian)
        address guardian = address(0x123);
        lsp11.addGuardian(recoveryAccount, guardian);

        // Expect a revert when nonGuardian tries to vote
        vm.expectRevert();
        lsp11.voteForRecovery(
            recoveryAccount,
            nonGuardian,
            guardianVotedAddress
        );
    }

    function testGuardianVoteAndCheckVoteCount() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address guardianVotedAddress = address(0xDEF);

        // Add guardian
        lsp11.addGuardian(recoveryAccount, guardian);

        // Simulate the guardian casting a vote
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, guardianVotedAddress);

        // Verify the vote
        address votedAddress = lsp11.getVotedAddressByGuardian(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            guardian
        );
        assertEq(votedAddress, guardianVotedAddress);

        // Verify the number of votes for the voted address
        uint256 voteCount = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            guardianVotedAddress
        );
        assertEq(voteCount, 1);
    }

    function testGuardianFirstRecoveryTimestamp() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address guardianVotedAddress = address(0xDEF);

        // Add guardian
        lsp11.addGuardian(recoveryAccount, guardian);

        // Simulate the guardian casting a vote
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, guardianVotedAddress);

        // Verify the vote
        uint256 timestamp = lsp11.getFirstRecoveryTimestampOf(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount)
        );

        assertEq(block.timestamp, timestamp);
    }

    function testSeveralGuardianVotesWontChangeFirstRecoveryTimestamp() public {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xCDE);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address guardianVotedAddress = address(0xDEF);

        // Add guardian
        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);

        // Simulate the guardian casting a vote
        uint256 firstVoteTimestamp = block.timestamp;
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, guardianVotedAddress);

        vm.warp(firstVoteTimestamp + 100);

        uint256 secondVoteTimestamp = block.timestamp;
        vm.prank(guardian2);
        lsp11.voteForRecovery(recoveryAccount, guardian2, guardianVotedAddress);

        // Verify the vote
        uint256 FirstTimestampFetched = lsp11.getFirstRecoveryTimestampOf(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount)
        );

        assertEq(firstVoteTimestamp, FirstTimestampFetched);
        assertEq(block.timestamp, secondVoteTimestamp);
        assertTrue(block.timestamp > firstVoteTimestamp);
    }

    function testTwoGuardiansVoteAndStateCheck() public {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address votedAddress = address(0x123);

        // Add two guardians
        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);

        // Guardian1 casts a vote
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, votedAddress);

        // Guardian2 casts a vote
        vm.prank(guardian2);
        lsp11.voteForRecovery(recoveryAccount, guardian2, votedAddress);

        // Verify votes for each guardian
        assertEq(
            lsp11.getVotedAddressByGuardian(
                recoveryAccount,
                lsp11.getRecoveryCounterOf(recoveryAccount),
                guardian1
            ),
            votedAddress
        );
        assertEq(
            lsp11.getVotedAddressByGuardian(
                recoveryAccount,
                lsp11.getRecoveryCounterOf(recoveryAccount),
                guardian2
            ),
            votedAddress
        );

        // Verify the total number of votes for the voted address
        uint256 totalVotes = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            votedAddress
        );
        assertEq(totalVotes, 2);
    }

    function testGuardianChangesVote() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address firstVotedAddress = address(0xDEF);
        address secondVotedAddress = address(0x123);

        // Add a guardian
        lsp11.addGuardian(recoveryAccount, guardian);

        // Guardian casts a vote for the first address
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, firstVotedAddress);

        // Guardian changes vote to the second address
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, secondVotedAddress);

        // Verify the updated vote
        address currentVotedAddress = lsp11.getVotedAddressByGuardian(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            guardian
        );
        assertEq(currentVotedAddress, secondVotedAddress);

        // Verify vote counts for both addresses
        uint256 firstAddressVotes = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            firstVotedAddress
        );
        uint256 secondAddressVotes = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            secondVotedAddress
        );
        assertEq(firstAddressVotes, 0); // The vote for the first address should be removed
        assertEq(secondAddressVotes, 1); // The vote for the second address should be counted
    }

    function testGuardianResetsVote() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address votedAddress = address(0xDEF);

        // Add a guardian
        lsp11.addGuardian(recoveryAccount, guardian);

        // Guardian casts a vote
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);

        // Guardian resets their vote by voting for address(0)
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0));

        // Verify the vote is reset
        address currentVotedAddress = lsp11.getVotedAddressByGuardian(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            guardian
        );
        assertEq(currentVotedAddress, address(0));

        // Verify the vote count for the initially voted address
        uint256 voteCount = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            votedAddress
        );
        assertEq(voteCount, 0); // The vote count should be reset to 0

        // Verify that address(0) does not have any votes
        uint256 voteCountForZeroAddress = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            address(0)
        );
        assertEq(voteCountForZeroAddress, 0); // Address(0) should have 0 votes
    }

    function testGuardiansVoteAccountCancelsRecoveryAndCheckVotes() public {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);
        address recoveryAccount = address(this); // The account for which recovery is being attempted
        address votedAddress = address(0x123);

        // Add guardians
        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);

        // Guardians cast their votes
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, votedAddress);
        vm.prank(guardian2);
        lsp11.voteForRecovery(recoveryAccount, guardian2, votedAddress);

        uint256 oldRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        );

        // Account owner cancels recovery process
        lsp11.cancelRecoveryProcess(recoveryAccount);

        uint256 newRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        );
        assertEq(newRecoveryCounter, oldRecoveryCounter + 1);

        // Verify votes for the old recovery counter
        uint256 oldCounterVotes = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            oldRecoveryCounter,
            votedAddress
        );
        assertEq(oldCounterVotes, 2);

        // Verify votes for the new recovery counter are reset
        uint256 newCounterVotes = lsp11.getVotesOfGuardianVotedAddress(
            recoveryAccount,
            newRecoveryCounter,
            votedAddress
        );
        assertEq(newCounterVotes, 0);
    }

    function testVotesMeetThresholdReturnsTrue() public {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);
        address recoveryAccount = address(this);
        address votedAddress = address(0x123);
        uint256 threshold = 2;

        // Add guardians and set threshold
        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);
        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        // Guardians cast their votes
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, votedAddress);
        vm.prank(guardian2);
        lsp11.voteForRecovery(recoveryAccount, guardian2, votedAddress);

        // Check if threshold is met
        bool thresholdMet = lsp11.hasReachedThreshold(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            votedAddress
        );
        assertTrue(thresholdMet);
    }

    function testVotesDoNotMeetThresholdReturnsFalse() public {
        address guardian1 = address(0xABC);
        address guardian2 = address(0xDEF);
        address recoveryAccount = address(this);
        address votedAddress = address(0x123);
        uint256 threshold = 2;

        // Add a guardian and set threshold
        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);
        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        // Only one guardian casts a vote
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, votedAddress);

        // Check if threshold is met
        bool thresholdMet = lsp11.hasReachedThreshold(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            votedAddress
        );
        assertFalse(thresholdMet);
    }

    function testGuardianCannotVoteTwiceForSameAddress() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this);
        address votedAddress = address(0xDEF);

        // Add a guardian
        lsp11.addGuardian(recoveryAccount, guardian);

        // Guardian casts a vote
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);

        // Expect a revert when the same guardian tries to vote for the same address again
        vm.expectRevert();
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);
    }

    function testRemovedGuardianCannotChangeVote() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this);
        address firstVotedAddress = address(0xDEF);
        address secondVotedAddress = address(0x123);

        // Add a guardian and cast a vote
        lsp11.addGuardian(recoveryAccount, guardian);
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, firstVotedAddress);

        // Remove the guardian
        lsp11.removeGuardian(recoveryAccount, guardian);

        // Expect a revert when the removed guardian tries to change their vote
        vm.expectRevert();
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, secondVotedAddress);
    }

    function testVoteInvalidationAfterCounterIncrement() public {
        address guardian = address(0xABC);
        address recoveryAccount = address(this);
        address votedAddress = address(0xDEF);

        // Add a guardian and cast a vote
        lsp11.addGuardian(recoveryAccount, guardian);
        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);

        // Increment the recovery counter, simulating a reset or progression in the recovery process
        lsp11.cancelRecoveryProcess(recoveryAccount);

        // Check if the vote made before the increment is still considered valid
        address currentVotedAddress = lsp11.getVotedAddressByGuardian(
            recoveryAccount,
            lsp11.getRecoveryCounterOf(recoveryAccount),
            guardian
        );

        // Assert that the vote is no longer valid for the new counter
        assertEq(
            currentVotedAddress,
            address(0),
            "Vote should be invalidated after recovery counter increment"
        );
    }

    function testDefaultRecoveryDelayIs40Minutes() public {
        address testAccount = address(this);

        // Fetch the current recovery delay for the test account
        uint256 currentRecoveryDelay = lsp11.getRecoveryDelayOf(testAccount);

        // Define the expected default recovery delay (40 minutes in seconds)
        uint256 expectedDefaultRecoveryDelay = 40 * 60;

        // Assert that the current recovery delay is equal to the expected default delay
        assertEq(
            currentRecoveryDelay,
            expectedDefaultRecoveryDelay,
            "The default recovery delay should be 40 minutes"
        );
    }

    function testRecoveryDisallowedWithNoGuardians() public {
        address recoveryAccount = address(this);

        lsp11.setRecoveryDelay(address(this), 0);

        // Attempt recovery process with no guardians set
        vm.expectRevert();
        vm.prank(address(0xABC));
        lsp11.recoverAccess(recoveryAccount, address(0xABC), 0x0, 0x0, "");
    }

    function testRecoveryDelaySetupAndBehavior() public {
        address recoveryAccount = address(this);
        uint256 recoveryDelay = 100; // Set a recovery delay

        // Set recovery delay
        lsp11.setRecoveryDelay(recoveryAccount, recoveryDelay);
        assertEq(lsp11.getRecoveryDelayOf(recoveryAccount), recoveryDelay);

        // Attempt recovery before delay period
        vm.expectRevert();
        vm.prank(address(0xABC));
        lsp11.recoverAccess(recoveryAccount, address(0xABC), 0x0, 0x0, "");
    }

    function testDefaultRecoveryDelaySetupAndBehavior() public {
        address recoveryAccount = address(this);

        assertEq(lsp11.getRecoveryDelayOf(recoveryAccount), 40 minutes);

        // Attempt recovery before delay period
        vm.expectRevert();
        vm.prank(address(0xABC));
        lsp11.recoverAccess(recoveryAccount, address(0xABC), 0x0, 0x0, "");
    }

    function testCannotCommitForADifferentAddress() public {
        address recoveryAccount = address(this);

        vm.expectRevert();
        vm.prank(address(0x123));
        lsp11.commitToRecover(recoveryAccount, address(0xABC), 0x0);
    }

    function testBehaviorWithZeroGuardiansThreshold() public {
        address recoveryAccount = address(this);

        lsp11.setRecoveryDelay(address(this), 0);

        assertEq(lsp11.getGuardiansThresholdOf(recoveryAccount), 0);

        // Attempt recovery process
        vm.expectRevert();
        vm.prank(address(0xABC));
        lsp11.recoverAccess(recoveryAccount, address(0xABC), 0x0, 0x0, "");
    }

    function testcommitToRecoverWithIncorrectVotedAddress() public {
        address recoveryAccount = address(this);
        address fakeVotedAddress = address(0xABC); // Fake votedAddress
        address realVotedAddress = address(0xDEF); // Real votedAddress
        bytes32 secret = keccak256(abi.encode(recoveryAccount, "secret"));
        bytes32 commitment = keccak256(abi.encode(realVotedAddress, secret));

        // Expect a revert due to incorrect votedAddress
        vm.expectRevert();
        lsp11.commitToRecover(recoveryAccount, fakeVotedAddress, commitment);
    }

    function testSuccessfulcommitToRecover() public {
        address recoveryAccount = address(this);
        address votedAddress = address(0xABC); // Valid votedAddress
        bytes32 secret = keccak256(abi.encode(recoveryAccount, "secret"));
        bytes32 commitment = keccak256(abi.encode(votedAddress, secret));

        // Commit plain secret
        vm.prank(votedAddress); // Simulate call from the votedAddress
        lsp11.commitToRecover(recoveryAccount, votedAddress, commitment);

        // Validate that the commitment was correctly set
        (bytes32 returnedCommitment, uint256 timestamp) = lsp11
            .getCommitmentInfoOf(
                recoveryAccount,
                lsp11.getRecoveryCounterOf(recoveryAccount),
                votedAddress
            );
        assertEq(returnedCommitment, commitment);
        assertEq(timestamp, block.timestamp);
    }

    function testcommitToRecoverRelayCallWithInvalidSignature() public {
        address recoveryAccount = address(this);
        address votedAddess = address(0xABC);
        bytes32 commitment = 0x0; // Example commitment
        bytes memory invalidSignature = new bytes(1); // Invalid signature

        bytes memory commitPayload = abi.encodeWithSelector(
            lsp11.commitToRecover.selector,
            recoveryAccount,
            votedAddess,
            commitment
        );

        // Expect revert due to invalid signature
        vm.expectRevert("ECDSA: invalid signature length");
        lsp11.executeRelayCall(invalidSignature, 0, 0, commitPayload);
    }

    function testcommitToRecoverRelayCallWithDifferentRecoveryCounter() public {
        (address votedAddess, uint256 votedAddressPK) = makeAddrAndKey(
            "votedAddress"
        );

        address recoveryAccount = address(this);
        bytes32 commitment = 0x0; // Example commitment
        uint256 wrongRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        ) + 1; // Incorrect recovery counter

        bytes memory commitPayload = abi.encodeWithSelector(
            lsp11.commitToRecover.selector,
            recoveryAccount,
            votedAddess,
            commitment
        );

        bytes memory encodedMessage = abi.encodePacked(
            uint256(11),
            block.chainid,
            uint256(0),
            uint256(0),
            uint256(0),
            wrongRecoveryCounter,
            commitPayload
        );

        bytes32 eip191Hash = ECDSA.toDataWithIntendedValidatorHash(
            address(lsp11),
            encodedMessage
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(votedAddressPK, eip191Hash); // Signature with wrong recovery counter
        bytes memory signature = toBytesSignature(v, r, s);
        // Expect revert due to recovery counter mismatch
        vm.expectRevert();
        lsp11.executeRelayCall(signature, 0, 0, commitPayload);
    }

    function testcommitToRecoverRelayCallWithCorrectConfig() public {
        (address votedAddress, uint256 votedAddressPK) = makeAddrAndKey(
            "votedAddress"
        );

        bytes32 commitment = 0x2b58178172d258515ef1d9e7c467f6f6a09510e863ef5ad383dbfc50721183df; // Example commitment
        uint256 recoveryCounter = lsp11.getRecoveryCounterOf(address(this));

        bytes memory commitPayload = abi.encodeWithSelector(
            lsp11.commitToRecover.selector,
            address(this),
            votedAddress,
            commitment
        );

        bytes memory encodedMessage = abi.encodePacked(
            uint256(11),
            block.chainid,
            uint256(0),
            uint256(0),
            uint256(0),
            recoveryCounter,
            commitPayload
        );
        bytes32 eip191Hash = ECDSA.toDataWithIntendedValidatorHash(
            address(lsp11),
            encodedMessage
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(votedAddressPK, eip191Hash); // Signature with wrong recovery counter
        bytes memory signature = toBytesSignature(v, r, s);
        // Expect revert due to recovery counter mismatch
        // vm.expectRevert();
        lsp11.executeRelayCall(signature, 0, 0, commitPayload);

        (bytes32 returnedCommitment, ) = lsp11.getCommitmentInfoOf(
            address(this),
            recoveryCounter,
            votedAddress
        );

        assertEq(returnedCommitment, commitment);
    }

    function testcommitToRecoverRelayCallWithDifferentSigner() public {
        (address votedAddress, ) = makeAddrAndKey("votedAddress");
        (address notVotedAddress, uint256 notVotedAddressPK) = makeAddrAndKey(
            "notvotedAddress"
        );

        address recoveryAccount = address(this);
        bytes32 commitment = 0x2b58178172d258515ef1d9e7c467f6f6a09510e863ef5ad383dbfc50721183df; // Example commitment

        uint256 recoveryCounter = lsp11.getRecoveryCounterOf(recoveryAccount);

        bytes memory commitPayload = abi.encodeWithSelector(
            lsp11.commitToRecover.selector,
            address(this),
            votedAddress,
            commitment
        );

        bytes memory encodedMessage = abi.encodePacked(
            uint256(11),
            block.chainid,
            uint256(0),
            uint256(0),
            uint256(0),
            recoveryCounter,
            commitPayload
        );
        bytes32 eip191Hash = ECDSA.toDataWithIntendedValidatorHash(
            address(lsp11),
            encodedMessage
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            notVotedAddressPK,
            eip191Hash
        ); // Signature with wrong recovery counter
        bytes memory signature = toBytesSignature(v, r, s);
        // Expect revert due to recovery counter mismatch
        vm.expectRevert(
            abi.encodeWithSelector(
                SignerIsNotVotedAddress.selector,
                votedAddress,
                notVotedAddress
            )
        );
        lsp11.executeRelayCall(signature, 0, 0, commitPayload);
    }

    function testRecoveryFailsIfGuardianThresholdNotMet() public {
        address recoveryAccount = address(this);
        uint256 threshold = 2;
        address guardian1 = address(0xABC);
        address guardian2 = address(0x123);

        lsp11.addGuardian(recoveryAccount, guardian1);
        lsp11.addGuardian(recoveryAccount, guardian2);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);
        // Add guardian and cast a vote
        vm.prank(guardian1);
        lsp11.voteForRecovery(recoveryAccount, guardian1, address(0xDEF));

        // Attempt recovery with votes below threshold
        vm.expectRevert();
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(recoveryAccount, address(0xDEF), 0x0, 0x0, "");
    }

    function testRecoverySucceedsIfGuardianVotesEqualThreshold() public {
        address recoveryAccount = address(this);
        uint256 threshold = 1;

        // Add guardian and cast a vote
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0xDEF));

        // Attempt recovery with votes equal to threshold
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(recoveryAccount, address(0xDEF), 0x0, 0x0, "");
        // Check for successful recovery logic here

        // Check if the recovery counter is incremented
        uint256 newRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        );
        assertEq(newRecoveryCounter, 1);
    }

    function testRecoveryFailsIfThresholdIsZero() public {
        address recoveryAccount = address(this);

        // Add guardian
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        // Attempt recovery with zero threshold
        vm.expectRevert();
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(recoveryAccount, address(0xDEF), 0x0, 0x0, "");
    }

    function testRecoveryFailWithWrongCommitment() public {
        address recoveryAccount = address(this);
        uint256 threshold = 1;

        bytes32 secret = keccak256(
            abi.encode(recoveryAccount, keccak256(abi.encodePacked("secret")))
        );

        bytes32 wrongSecret = keccak256(
            abi.encode(
                recoveryAccount,
                keccak256(abi.encodePacked("wrongsecret"))
            )
        );

        lsp11.setRecoverySecretHash(recoveryAccount, secret);

        // Add guardian and cast a vote
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0xDEF));

        bytes32 commitment = keccak256(abi.encode(address(0xDEF), wrongSecret));

        vm.prank(address(0xDEF));
        lsp11.commitToRecover(recoveryAccount, address(0xDEF), commitment);

        vm.warp(block.timestamp + 101);
        // Attempt recovery with votes equal to threshold

        vm.expectRevert();
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(
            recoveryAccount,
            address(0xDEF),
            keccak256(abi.encodePacked("secret")),
            0x0,
            ""
        );
    }

    function testRecoveryFailWithRecoveryingTooEarlyAfterCommit() public {
        address recoveryAccount = address(this);
        uint256 threshold = 1;

        bytes32 secret = keccak256(
            abi.encode(recoveryAccount, keccak256(abi.encodePacked("secret")))
        );

        lsp11.setRecoverySecretHash(recoveryAccount, secret);

        // Add guardian and cast a vote
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0xDEF));

        bytes32 commitment = keccak256(abi.encode(address(0xDEF), secret));

        vm.prank(address(0xDEF));
        lsp11.commitToRecover(recoveryAccount, address(0xDEF), commitment);

        // Attempt recovery with votes equal to threshold
        vm.expectRevert();
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(
            recoveryAccount,
            address(0xDEF),
            keccak256(abi.encodePacked("secret")),
            0x0,
            ""
        );
    }

    function testRecoveryFailWithCorrectCommitmentWrongSecret() public {
        address recoveryAccount = address(this);
        uint256 threshold = 1;

        bytes32 secret = keccak256(
            abi.encode(recoveryAccount, keccak256(abi.encodePacked("secret")))
        );

        lsp11.setRecoverySecretHash(recoveryAccount, keccak256(hex"aabbddcc"));

        // Add guardian and cast a vote
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0xDEF));

        bytes32 commitment = keccak256(abi.encode(address(0xDEF), secret));

        vm.prank(address(0xDEF));
        lsp11.commitToRecover(recoveryAccount, address(0xDEF), commitment);

        vm.warp(block.timestamp + 101);
        // Attempt recovery with votes equal to threshold
        vm.expectRevert();
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(
            recoveryAccount,
            address(0xDEF),
            keccak256(abi.encodePacked("secret")),
            0x0,
            ""
        );
    }

    function testRecoverySuccessfull() public {
        address recoveryAccount = address(this);
        uint256 threshold = 1;

        bytes32 secret = keccak256(
            abi.encode(recoveryAccount, keccak256(abi.encodePacked("secret")))
        );

        lsp11.setRecoverySecretHash(recoveryAccount, secret);

        // Add guardian and cast a vote
        address guardian = address(0xABC);
        lsp11.addGuardian(recoveryAccount, guardian);

        lsp11.setRecoveryDelay(address(this), 0);

        lsp11.setGuardiansThreshold(recoveryAccount, threshold);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, address(0xDEF));

        bytes32 commitment = keccak256(abi.encode(address(0xDEF), secret));

        vm.prank(address(0xDEF));
        lsp11.commitToRecover(recoveryAccount, address(0xDEF), commitment);

        vm.warp(block.timestamp + 101);
        // Attempt recovery with votes equal to threshold
        vm.prank(address(0xDEF));
        lsp11.recoverAccess(
            recoveryAccount,
            address(0xDEF),
            keccak256(abi.encodePacked("secret")),
            0x0,
            ""
        );

        // Check if the recovery counter is incremented
        uint256 newRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        );
        assertEq(newRecoveryCounter, 1);
    }

    function testRecoverAccessRelayCallWithInvalidSignature() public {
        (address votedAddress, ) = makeAddrAndKey("votedAddress");
        (address notVotedAddress, uint256 notVotedAddressPK) = makeAddrAndKey(
            "notVotedAddress"
        );
        address guardian = address(0x123);

        address recoveryAccount = address(this);
        lsp11.addGuardian(recoveryAccount, guardian);
        lsp11.setRecoveryDelay(recoveryAccount, 0);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);

        uint256 recoveryCounter = lsp11.getRecoveryCounterOf(recoveryAccount);

        bytes memory recoverPayload = abi.encodeWithSelector(
            lsp11.recoverAccess.selector,
            address(this),
            votedAddress,
            bytes32(0),
            bytes32(0),
            ""
        );

        bytes memory encodedMessage = abi.encodePacked(
            uint256(11),
            block.chainid,
            uint256(0),
            uint256(0),
            uint256(0),
            recoveryCounter,
            recoverPayload
        );
        bytes32 eip191Hash = ECDSA.toDataWithIntendedValidatorHash(
            address(lsp11),
            encodedMessage
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            notVotedAddressPK,
            eip191Hash
        ); // Signature with wrong recovery counter
        bytes memory signature = toBytesSignature(v, r, s);
        // Expect revert due to recovery counter mismatch
        vm.expectRevert(
            abi.encodeWithSelector(
                SignerIsNotVotedAddress.selector,
                votedAddress,
                notVotedAddress
            )
        );
        lsp11.executeRelayCall(signature, 0, 0, recoverPayload);
    }

    function testRecoverAccessRelayCallWithValidSignature() public {
        (address votedAddress, uint256 votedAddressPK) = makeAddrAndKey(
            "votedAddress"
        );
        address guardian = address(0x123);

        address recoveryAccount = address(this);
        lsp11.addGuardian(recoveryAccount, guardian);
        lsp11.setRecoveryDelay(recoveryAccount, 0);
        lsp11.setGuardiansThreshold(recoveryAccount, 1);

        vm.prank(guardian);
        lsp11.voteForRecovery(recoveryAccount, guardian, votedAddress);

        uint256 recoveryCounter = lsp11.getRecoveryCounterOf(recoveryAccount);

        bytes memory recoverPayload = abi.encodeWithSelector(
            lsp11.recoverAccess.selector,
            address(this),
            votedAddress,
            bytes32(0),
            bytes32(0),
            ""
        );

        bytes memory encodedMessage = abi.encodePacked(
            uint256(11),
            block.chainid,
            uint256(0),
            uint256(0),
            uint256(0),
            recoveryCounter,
            recoverPayload
        );
        bytes32 eip191Hash = ECDSA.toDataWithIntendedValidatorHash(
            address(lsp11),
            encodedMessage
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(votedAddressPK, eip191Hash); // Signature with wrong recovery counter
        bytes memory signature = toBytesSignature(v, r, s);
        lsp11.executeRelayCall(signature, 0, 0, recoverPayload);

        // Check if the recovery counter is incremented
        uint256 newRecoveryCounter = lsp11.getRecoveryCounterOf(
            recoveryAccount
        );
        assertEq(newRecoveryCounter, 1);
    }

    function testLSP11InterfaceIdConstruction() public {
        bytes4 lsp11InterfaceId = type(ILSP11SocialRecovery).interfaceId ^
            type(ILSP25ExecuteRelayCall).interfaceId;
        assertEq(
            abi.encodePacked(lsp11InterfaceId),
            abi.encodePacked(_INTERFACEID_LSP11)
        );
    }

    function testLSP11SupportsInterfaceId() public {
        bool isSupported = lsp11.supportsInterface(_INTERFACEID_LSP11);
        assertTrue(isSupported);
    }

    function toBytesSignature(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (bytes memory signature) {
        signature = new bytes(65);

        assembly {
            mstore(add(signature, 32), r)
            mstore(add(signature, 64), s)
            mstore8(add(signature, 96), v)
        }
    }
}
