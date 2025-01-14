import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  MyVotingToken,
  MyVotingToken__factory,
  MyGovernor,
  MyGovernor__factory,
} from '../typechain';
import { time, mine } from '@nomicfoundation/hardhat-network-helpers';
import { LSP7_TYPE_IDS } from '../constants';

describe('Comprehensive Governor and Token Tests', () => {
  let token: MyVotingToken;
  let governor: MyGovernor;
  let owner: SignerWithAddress;
  let proposer: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  let randomEOA: SignerWithAddress;

  const VOTING_DELAY = 7200; // 1 day in blocks
  const VOTING_PERIOD = 7200; // 1 day in blocks
  const PROPOSAL_THRESHOLD = ethers.parseEther('1'); // 1 full unit of token
  const QUORUM_FRACTION = 1; // 1%

  beforeEach(async () => {
    [owner, proposer, voter1, voter2, voter3, randomEOA] = await ethers.getSigners();

    token = await new MyVotingToken__factory(owner).deploy();
    governor = await new MyGovernor__factory(owner).deploy(token.target);

    // Mint initial tokens
    await token.mint(proposer.address, PROPOSAL_THRESHOLD * BigInt(2));
    await token.mint(voter1.address, ethers.parseEther('10'));
    await token.mint(voter2.address, ethers.parseEther('20'));
    await token.mint(voter3.address, ethers.parseEther('30'));
  });

  describe('Token and Governor Setup', () => {
    it('should have correct initial settings', async () => {
      expect(await governor.votingDelay()).to.equal(VOTING_DELAY);
      expect(await governor.votingPeriod()).to.equal(VOTING_PERIOD);
      expect(await governor.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
      expect(await governor.token()).to.equal(token.target);
    });

    it('should have correct initial token distribution', async () => {
      expect(await token.balanceOf(proposer.address)).to.equal(PROPOSAL_THRESHOLD * BigInt(2));
      expect(await token.balanceOf(voter1.address)).to.equal(ethers.parseEther('10'));
      expect(await token.balanceOf(voter2.address)).to.equal(ethers.parseEther('20'));
      expect(await token.balanceOf(voter3.address)).to.equal(ethers.parseEther('30'));
    });

    it('should have zero initial voting power for all accounts', async () => {
      expect(await token.getVotes(proposer.address)).to.equal(0);
      expect(await token.getVotes(voter1.address)).to.equal(0);
      expect(await token.getVotes(voter2.address)).to.equal(0);
      expect(await token.getVotes(voter3.address)).to.equal(0);
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
      await token.connect(proposer).delegate(proposer.address);

      await expect(
        governor.connect(proposer).propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1'),
      ).to.emit(governor, 'ProposalCreated');
    });

    it('should fail to propose with empty proposal', async () => {
      await token.connect(proposer).delegate(proposer.address);

      await expect(
        governor.connect(proposer).propose([], [], [], 'Empty Proposal'),
      ).to.be.revertedWith('Governor: empty proposal');
    });
  });

  describe('Voting Power and Delegation', () => {
    it('should correctly report voting power after delegation', async () => {
      await token.connect(voter1).delegate(voter1.address);
      expect(await token.getVotes(voter1.address)).to.equal(ethers.parseEther('10'));
    });

    it('should correctly transfer voting power when transferring tokens', async () => {
      await token.connect(voter1).delegate(voter1.address);
      await token
        .connect(voter1)
        .transfer(voter1.address, voter2.address, ethers.parseEther('5'), true, '0x');

      expect(await token.getVotes(voter1.address)).to.equal(ethers.parseEther('5'));
      expect(await token.balanceOf(voter2.address)).to.equal(ethers.parseEther('25'));
    });

    it('should correctly report delegates', async () => {
      await token.connect(voter1).delegate(voter2.address);
      expect(await token.delegates(voter1.address)).to.equal(voter2.address);
    });

    it('should allow changing delegates', async () => {
      await token.connect(voter1).delegate(voter2.address);
      await token.connect(voter1).delegate(voter3.address);
      expect(await token.delegates(voter1.address)).to.equal(voter3.address);
    });

    it('should update voting power when receiving tokens', async () => {
      await token.connect(voter1).delegate(voter1.address);
      await token
        .connect(voter2)
        .transfer(voter2.address, voter1.address, ethers.parseEther('5'), true, '0x');
      expect(await token.getVotes(voter1.address)).to.equal(ethers.parseEther('15'));
    });

    describe('Delegation Notifications', () => {
      let mockUniversalReceiver;

      beforeEach(async () => {
        const MockUniversalReceiver = await ethers.getContractFactory('MockUniversalReceiver');
        mockUniversalReceiver = await MockUniversalReceiver.deploy();
      });

      it('should notify delegatee with correct data format', async () => {
        const expectedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'address', 'uint256'],
          [voter1.address, voter1.address, ethers.parseEther('10')],
        );

        await expect(token.connect(voter1).delegate(await mockUniversalReceiver.getAddress()))
          .to.emit(mockUniversalReceiver, 'UniversalReceiverCalled')
          .withArgs(
            token.target,
            LSP7_TYPE_IDS.LSP7Tokens_VotesDelegateeNotification,
            expectedData,
          );
      });

      it('should not notify delegatee when delegator has zero balance', async () => {
        const [zeroBalanceAccount] = await ethers.getSigners();

        await expect(token.connect(zeroBalanceAccount).delegate(voter2.address)).to.not.emit(
          mockUniversalReceiver,
          'UniversalReceiverCalled',
        );
      });

      it('should not notify address(0)', async () => {
        await expect(token.connect(voter1).delegate(ethers.ZeroAddress)).to.not.emit(
          mockUniversalReceiver,
          'UniversalReceiverCalled',
        );
      });
    });
  });

  describe('Voting Process and Proposal Lifecycle', () => {
    let proposalId: string;

    beforeEach(async () => {
      await token.connect(proposer).delegate(proposer.address);
      await token.connect(voter1).delegate(voter1.address);
      await token.connect(voter2).delegate(voter2.address);
      await token.connect(voter3).delegate(voter3.address);

      proposalId = await governor
        .connect(proposer)
        .propose.staticCall([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1');

      await governor
        .connect(proposer)
        .propose([randomEOA.address], [0], ['0xaabbccdd'], 'Proposal #1');
    });

    it('should not allow voting before voting delay has passed', async () => {
      await expect(governor.connect(voter1).castVote(proposalId, 1)).to.be.revertedWith(
        'Governor: vote not currently active',
      );
    });

    it('should allow voting after voting delay has passed', async () => {
      await mine(VOTING_DELAY + 1);
      await expect(governor.connect(voter1).castVote(proposalId, 1)).to.emit(governor, 'VoteCast');
    });

    it('should correctly count votes and update quorum', async () => {
      await mine(VOTING_DELAY + 1);
      await governor.connect(voter1).castVote(proposalId, 1); // Yes vote
      await governor.connect(voter2).castVote(proposalId, 0); // No vote
      await governor.connect(voter3).castVote(proposalId, 2); // Abstain

      const proposal = await governor.proposalVotes(proposalId);
      expect(proposal.forVotes).to.equal(ethers.parseEther('10'));
      expect(proposal.againstVotes).to.equal(ethers.parseEther('20'));
      expect(proposal.abstainVotes).to.equal(ethers.parseEther('30'));
    });

    it('should not allow voting after voting period has ended', async () => {
      await mine(VOTING_DELAY + VOTING_PERIOD + 1);
      await expect(governor.connect(voter1).castVote(proposalId, 1)).to.be.revertedWith(
        'Governor: vote not currently active',
      );
    });

    it('should correctly determine if quorum is reached', async () => {
      const totalSupply = await token.totalSupply();
      const quorumRequired = (totalSupply * BigInt(QUORUM_FRACTION)) / BigInt(100);

      await mine(VOTING_DELAY + 1);
      await governor.connect(voter3).castVote(proposalId, 1); // This should meet quorum

      expect(await governor.quorum((await time.latestBlock()) - 1)).to.be.lte(quorumRequired);
    });

    it('should allow proposal execution only after voting period and timelock', async () => {
      await mine(VOTING_DELAY + 1);
      await governor.connect(voter3).castVote(proposalId, 1); // Ensure quorum and pass

      await expect(
        governor.execute([randomEOA.address], [0], ['0xaabbccdd'], ethers.id('Proposal #1')),
      ).to.be.revertedWith('Governor: proposal not successful');

      await mine(await governor.votingPeriod());

      await expect(
        governor.execute([randomEOA.address], [0], ['0xaabbccdd'], ethers.id('Proposal #1')),
      ).to.emit(governor, 'ProposalExecuted');
    });

    it('should not allow double voting', async () => {
      await mine(VOTING_DELAY + 1);
      await governor.connect(voter1).castVote(proposalId, 1);
      await expect(governor.connect(voter1).castVote(proposalId, 1)).to.be.revertedWith(
        'GovernorVotingSimple: vote already cast',
      );
    });
  });

  describe('Advanced Voting Power Scenarios', () => {
    it('should correctly calculate voting power at past timepoints', async () => {
      await token.connect(voter1).delegate(voter1.address);
      await mine(); // Mine a block to record the delegation

      const blockNumber1 = await ethers.provider.getBlockNumber();
      expect(await token.getPastVotes(voter1.address, blockNumber1 - 1)).to.equal(
        ethers.parseEther('10'),
      );

      await token.mint(voter1.address, ethers.parseEther('10'));
      await mine(); // Mine a block to record the mint

      const blockNumber2 = await ethers.provider.getBlockNumber();
      expect(await token.getPastVotes(voter1.address, blockNumber2 - 1)).to.equal(
        ethers.parseEther('20'),
      );
    });

    it('should correctly report past total supply', async () => {
      const initialSupply = await token.totalSupply();
      const blockNumber1 = await ethers.provider.getBlockNumber();

      await token.mint(voter1.address, ethers.parseEther('100'));
      await mine(); // Mine a block to record the mint

      const blockNumber2 = await ethers.provider.getBlockNumber();

      expect(await token.getPastTotalSupply(blockNumber1)).to.equal(initialSupply);
      expect(await token.getPastTotalSupply(blockNumber2 - 1)).to.equal(
        initialSupply + ethers.parseEther('100'),
      );
    });

    it('should not allow querying future timepoints', async () => {
      const currentBlock = await ethers.provider.getBlockNumber();
      const futureBlock = currentBlock + 1000;

      await expect(token.getPastVotes(voter1.address, futureBlock)).to.be.revertedWith(
        'LSP7Votes: future lookup',
      );
      await expect(token.getPastTotalSupply(futureBlock)).to.be.revertedWith(
        'LSP7Votes: future lookup',
      );
    });
  });
});
