import { expect } from 'chai';
import { id } from 'ethers';
import { network } from 'hardhat';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import {
  type MyVotingNFT,
  MyVotingNFT__factory,
  type MyGovernor,
  MyGovernor__factory,
  type MockUniversalReceiver,
  MockUniversalReceiver__factory,
} from '../types/ethers-contracts/index.js';
import { LSP8_TYPE_IDS } from '../constants.js';

let ethers: HardhatEthers;

const { networkHelpers } = await network.connect();
const { time, mine } = networkHelpers;

describe('Comprehensive Governor and NFT Tests', () => {
  let nft: MyVotingNFT;
  let governor: MyGovernor;
  let owner: HardhatEthersSigner;
  let proposer: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;
  let randomEOA: HardhatEthersSigner;

  const VOTING_DELAY = 7200; // 1 day in blocks
  const VOTING_PERIOD = 7200; // 1 day in blocks
  const PROPOSAL_THRESHOLD = 1; // 1 NFT
  const QUORUM_FRACTION = 1; // 1%

  beforeEach(async () => {
    ({ ethers } = await network.connect());
    [owner, proposer, voter1, voter2, voter3, randomEOA] = await ethers.getSigners();

    nft = await new MyVotingNFT__factory(owner).deploy();
    governor = await new MyGovernor__factory(owner).deploy(nft.target);

    // Mint initial NFTs
    await nft.mint(proposer.address, id('1'));
    await nft.mint(proposer.address, id('2'));
    await nft.mint(voter1.address, id('3'));
    await nft.mint(voter2.address, id('4'));
    await nft.mint(voter2.address, id('5'));
    await nft.mint(voter3.address, id('6'));
    await nft.mint(voter3.address, id('7'));
    await nft.mint(voter3.address, id('8'));
  });

  describe('NFT and Governor Setup', () => {
    it('should have correct initial settings', async () => {
      expect(await governor.votingDelay()).to.equal(VOTING_DELAY);
      expect(await governor.votingPeriod()).to.equal(VOTING_PERIOD);
      expect(await governor.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
      expect(await governor.token()).to.equal(nft.target);
    });

    it('should have correct initial NFT distribution', async () => {
      expect(await nft.balanceOf(proposer.address)).to.equal(2);
      expect(await nft.balanceOf(voter1.address)).to.equal(1);
      expect(await nft.balanceOf(voter2.address)).to.equal(2);
      expect(await nft.balanceOf(voter3.address)).to.equal(3);
    });

    it('should have zero initial voting power for all accounts', async () => {
      expect(await nft.getVotes(proposer.address)).to.equal(0);
      expect(await nft.getVotes(voter1.address)).to.equal(0);
      expect(await nft.getVotes(voter2.address)).to.equal(0);
      expect(await nft.getVotes(voter3.address)).to.equal(0);
    });
  });

  describe('Proposal Creation', () => {
    it('should fail to propose when balance is below threshold', async () => {
      await expect(
        governor.connect(voter1).propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1'),
      ).to.be.revertedWith('Governor: proposer votes below proposal threshold');
    });

    it('should fail to propose when balance is sufficient but not delegated', async () => {
      await expect(
        governor.connect(proposer).propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1'),
      ).to.be.revertedWith('Governor: proposer votes below proposal threshold');
    });

    it('should successfully propose after delegating', async () => {
      await nft.connect(proposer).delegate(proposer.address);

      await expect(
        governor.connect(proposer).propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1'),
      ).to.emit(governor, 'ProposalCreated');
    });
  });

  describe('Voting Power and Delegation', () => {
    it('should correctly report voting power after delegation', async () => {
      await nft.connect(voter1).delegate(voter1.address);
      expect(await nft.getVotes(voter1.address)).to.equal(1);
    });

    it('should correctly transfer voting power when transferring NFTs', async () => {
      await nft.connect(voter1).delegate(voter1.address);
      await nft.connect(voter1).transfer(voter1.address, voter2.address, id('3'), true, '0x');

      expect(await nft.getVotes(voter1.address)).to.equal(0);
      expect(await nft.balanceOf(voter2.address)).to.equal(3);
    });

    it('should correctly report delegates', async () => {
      await nft.connect(voter1).delegate(voter2.address);
      expect(await nft.delegates(voter1.address)).to.equal(voter2.address);
    });
  });

  describe('Voting Process and Proposal Lifecycle', () => {
    let proposalId;

    beforeEach(async () => {
      // Setup for voting tests
      await nft.connect(proposer).delegate(proposer.address);
      await nft.connect(voter1).delegate(voter1.address);
      await nft.connect(voter2).delegate(voter2.address);
      await nft.connect(voter3).delegate(voter3.address);

      proposalId = await governor
        .connect(proposer)
        .propose.staticCall([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1');

      await governor
        .connect(proposer)
        .propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1');
    });

    it('should correctly count votes and update quorum', async () => {
      await mine(VOTING_DELAY + 1);
      await governor.connect(voter1).castVote(proposalId, 1); // Yes vote
      await governor.connect(voter2).castVote(proposalId, 0); // No vote
      await governor.connect(voter3).castVote(proposalId, 2); // Abstain

      const proposal = await governor.proposalVotes(proposalId);
      expect(proposal.forVotes).to.equal(1);
      expect(proposal.againstVotes).to.equal(2);
      expect(proposal.abstainVotes).to.equal(3);
    });

    it('should correctly determine if quorum is reached', async () => {
      const totalSupply = await nft.totalSupply();
      const quorumRequired = (totalSupply * BigInt(QUORUM_FRACTION)) / BigInt(100);

      await mine(VOTING_DELAY + 1);
      await governor.connect(voter3).castVote(proposalId, 1); // This should meet quorum

      expect(await governor.quorum((await time.latestBlock()) - 1)).to.be.gte(quorumRequired);
    });
  });

  describe('Advanced Voting Power Scenarios', () => {
    it('should correctly calculate voting power at past timepoints', async () => {
      await nft.connect(voter1).delegate(voter1.address);
      await mine(); // Mine a block to record the delegation

      const blockNumber1 = await ethers.provider.getBlockNumber();
      expect(await nft.getPastVotes(voter1.address, blockNumber1 - 1)).to.equal(1);

      await nft.mint(voter1.address, id('9'));
      await mine(); // Mine a block to record the mint

      const blockNumber2 = await ethers.provider.getBlockNumber();
      expect(await nft.getPastVotes(voter1.address, blockNumber2 - 1)).to.equal(2);
    });

    it('should correctly report past total supply', async () => {
      const initialSupply = await nft.totalSupply();
      const blockNumber1 = await ethers.provider.getBlockNumber();

      await nft.mint(voter1.address, id('10'));
      await mine(); // Mine a block to record the mint

      const blockNumber2 = await ethers.provider.getBlockNumber();

      expect(await nft.getPastTotalSupply(blockNumber1)).to.equal(initialSupply);
      expect(await nft.getPastTotalSupply(blockNumber2 - 1)).to.equal(initialSupply + BigInt(1));
    });
  });

  describe('Delegation Notifications', () => {
    let mockUniversalReceiver: MockUniversalReceiver;

    beforeEach(async () => {
      mockUniversalReceiver = await new MockUniversalReceiver__factory(owner).deploy();
    });

    it('should notify delegatee with correct data format', async () => {
      const expectedDelegateeData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'address', 'uint256'],
        [voter1.address, voter1.address, 1],
      );

      await expect(nft.connect(voter1).delegate(await mockUniversalReceiver.getAddress()))
        .to.emit(mockUniversalReceiver, 'UniversalReceiverCalled')
        .withArgs(
          await nft.getAddress(),
          LSP8_TYPE_IDS.LSP8Tokens_VotesDelegateeNotification,
          expectedDelegateeData,
        );
    });

    it('should not notify when delegating to address(0)', async () => {
      await expect(nft.connect(voter1).delegate(ethers.ZeroAddress)).to.not.emit(
        mockUniversalReceiver,
        'UniversalReceiverCalled',
      );
    });
  });
});
