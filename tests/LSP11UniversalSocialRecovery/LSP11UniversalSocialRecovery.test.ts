import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP11UniversalSocialRecovery__factory, LSP11UniversalSocialRecovery } from '../../types';

import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

type UniversalSocialRecoveryTestAccounts = {
  account1: SignerWithAddress;
  guardians: SignerWithAddress[];
  votedAddresses: SignerWithAddress[];
};

function generateSecretGuardian(account, guardian) {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address', 'address'], [account, guardian]),
  );
}

function generateSecretHash(secret) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secret));
}

function generateSaltedSecretHash(account, secret) {
  const plainHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secret));
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address', 'bytes32'], [account, plainHash]),
  );
}

function generateCommitment(recoverer, account, secret) {
  const saltedHash = generateSaltedSecretHash(account, secret);
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address', 'bytes32'], [recoverer, saltedHash]),
  );
}

const getNamedAccounts = async () => {
  const [
    account1,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
    votedAddress1,
    votedAddress2,
    votedAddress3,
  ] = await ethers.getSigners();

  return {
    account1,
    guardians: [guardian1, guardian2, guardian3, guardian4],
    votedAddresses: [votedAddress1, votedAddress2, votedAddress3],
  };
};

type UniversalSocialRecoveryTestContext = {
  accounts: UniversalSocialRecoveryTestAccounts;
  lsp11Contract: LSP11UniversalSocialRecovery;
};

describe('LSP11UniversalSocialRecovery', () => {
  const buildTestContext = async (): Promise<UniversalSocialRecoveryTestContext> => {
    const accounts = await getNamedAccounts();

    const lsp11Contract = await new LSP11UniversalSocialRecovery__factory(
      accounts.account1,
    ).deploy();

    return { accounts, lsp11Contract };
  };

  describe('When using LSP11UniversalSocialRecovery', () => {
    let context: UniversalSocialRecoveryTestContext;

    beforeEach(async () => {
      context = await buildTestContext();
    });

    describe('Guardian management by account', () => {
      it('Account can add a guardian', async () => {
        const { accounts, lsp11Contract } = context;
        const guardianToAdd = accounts.guardians[0].address;

        // Listen for the event
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .addGuardian(accounts.account1.address, guardianToAdd),
        )
          .to.emit(lsp11Contract, 'GuardianAdded')
          .withArgs(accounts.account1.address, guardianToAdd);

        // Verify the guardian was added in the contract's state using isGuardianOf
        const isGuardian = await lsp11Contract.isGuardianOf(
          accounts.account1.address,
          guardianToAdd,
        );
        expect(isGuardian).to.be.true;

        // Verify the guardian was added in the contract's state using getGuardiansOf
        const guardiansList = await lsp11Contract.getGuardiansOf(accounts.account1.address);
        expect(guardiansList).to.include(guardianToAdd);
      });
    });

    describe('Guardian removal by account', () => {
      it('Account can remove an added guardian', async () => {
        const { accounts, lsp11Contract } = context;
        const guardianToRemove = accounts.guardians[0].address;

        // First, ensure the guardian is added
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, guardianToRemove);

        // Listen for the event
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .removeGuardian(accounts.account1.address, guardianToRemove),
        )
          .to.emit(lsp11Contract, 'GuardianRemoved')
          .withArgs(accounts.account1.address, guardianToRemove);

        // Verify the guardian was removed using isGuardianOf
        const isGuardian = await lsp11Contract.isGuardianOf(
          accounts.account1.address,
          guardianToRemove,
        );
        expect(isGuardian).to.be.false;

        // Verify the guardian was removed using getGuardiansOf
        const guardiansList = await lsp11Contract.getGuardiansOf(accounts.account1.address);
        expect(guardiansList).to.not.include(guardianToRemove);
      });

      it('Account cannot remove a non-existing guardian', async () => {
        const { accounts, lsp11Contract } = context;
        const nonGuardian = accounts.guardians[1].address;

        // Attempt to remove a non-guardian should revert
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .removeGuardian(accounts.account1.address, nonGuardian),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'GuardianNotFound')
          .withArgs(accounts.account1.address, nonGuardian);
      });
    });

    describe('Secret Guardian management by account', () => {
      it('Account can add a secret guardian', async () => {
        const { accounts, lsp11Contract } = context;
        const secretGuardianHash = generateSecretGuardian(
          accounts.account1.address,
          accounts.guardians[2].address,
        );

        // Add the secret guardian
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .addSecretGuardian(accounts.account1.address, secretGuardianHash),
        )
          .to.emit(lsp11Contract, 'SecretGuardianAdded')
          .withArgs(accounts.account1.address, secretGuardianHash);

        // Verify using isSecretGuardianOf
        const isSecretGuardian = await lsp11Contract.isSecretGuardianOf(
          accounts.account1.address,
          secretGuardianHash,
        );
        expect(isSecretGuardian).to.be.true;

        // Verify using getSecretGuardiansOf
        const secretGuardiansList = await lsp11Contract.getSecretGuardiansOf(
          accounts.account1.address,
        );
        expect(secretGuardiansList).to.include(secretGuardianHash);
      });

      it('Account can remove an added secret guardian', async () => {
        const { accounts, lsp11Contract } = context;
        const secretGuardianHashToRemove = generateSecretGuardian(
          accounts.account1.address,
          accounts.guardians[3].address,
        );

        // First, ensure the secret guardian is added
        await lsp11Contract
          .connect(accounts.account1)
          .addSecretGuardian(accounts.account1.address, secretGuardianHashToRemove);

        // Remove the secret guardian
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .removeSecretGuardian(accounts.account1.address, secretGuardianHashToRemove),
        )
          .to.emit(lsp11Contract, 'SecretGuardianRemoved')
          .withArgs(accounts.account1.address, secretGuardianHashToRemove);

        // Verify using isSecretGuardianOf
        const isSecretGuardian = await lsp11Contract.isSecretGuardianOf(
          accounts.account1.address,
          secretGuardianHashToRemove,
        );
        expect(isSecretGuardian).to.be.false;

        // Verify using getSecretGuardiansOf
        const secretGuardiansList = await lsp11Contract.getSecretGuardiansOf(
          accounts.account1.address,
        );
        expect(secretGuardiansList).to.not.include(secretGuardianHashToRemove);
      });
    });

    describe('Guardian Threshold Management', () => {
      it('Account can set a valid guardian threshold', async () => {
        const { lsp11Contract, accounts } = context;

        // Adding two guardians
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);

        // Setting threshold to 2
        const tx = await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);
        await expect(tx)
          .to.emit(lsp11Contract, 'GuardiansThresholdChanged')
          .withArgs(accounts.account1.address, 2);

        const threshold = await lsp11Contract.getGuardiansThresholdOf(accounts.account1.address);
        expect(threshold).to.equal(2);
      });

      it('Account cannot set a threshold higher than the number of guardians', async () => {
        const { lsp11Contract, accounts } = context;

        // Adding one guardian
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        // Trying to set threshold to 2 should revert
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .setGuardiansThreshold(accounts.account1.address, 2),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'ThresholdExceedsGuardianNumber')
          .withArgs(accounts.account1.address, 2);
      });

      it('Account cannot remove a guardian if it goes below the threshold', async () => {
        const { lsp11Contract, accounts } = context;

        // Adding two guardians and setting threshold to 2
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);
        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);

        // Trying to remove a guardian should revert
        await expect(
          lsp11Contract
            .connect(accounts.account1)
            .removeGuardian(accounts.account1.address, accounts.guardians[0].address),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'GuardianNumberCannotGoBelowThreshold')
          .withArgs(accounts.account1.address, 2);
      });
    });

    describe('Secret Hash Management', () => {
      it('Account can set a secret hash and it is reflected in the contract', async () => {
        const { lsp11Contract, accounts } = context;
        const secretHash = generateSaltedSecretHash(accounts.account1.address, 'secret');

        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('secret'));

        const tx = await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, secretHash);
        await expect(tx)
          .to.emit(lsp11Contract, 'SecretHashChanged')
          .withArgs(accounts.account1.address, secretHash);

        const storedSecretHash = await lsp11Contract.getSecretHashOf(accounts.account1.address);
        expect(storedSecretHash).to.equal(secretHash);
      });

      it('Account can replace an existing secret hash', async () => {
        const { lsp11Contract, accounts } = context;
        const initialSecretHash = generateSaltedSecretHash(accounts.account1.address, 'initial');
        const newSecretHash = generateSaltedSecretHash(accounts.account1.address, 'newSecret');

        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, initialSecretHash);
        const tx = await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, newSecretHash);
        await expect(tx)
          .to.emit(lsp11Contract, 'SecretHashChanged')
          .withArgs(accounts.account1.address, newSecretHash);

        const storedSecretHash = await lsp11Contract.getSecretHashOf(accounts.account1.address);
        expect(storedSecretHash).to.equal(newSecretHash);
      });
    });

    describe('Batch Calls for Recovery Process Setup', () => {
      it('should successfully execute batch calls to add guardians, set threshold, and set secret hash', async () => {
        const { lsp11Contract, accounts } = context;

        const addGuardian1Data = lsp11Contract.interface.encodeFunctionData('addGuardian', [
          accounts.account1.address,
          accounts.guardians[0].address,
        ]);

        const addGuardian2Data = lsp11Contract.interface.encodeFunctionData('addGuardian', [
          accounts.account1.address,
          accounts.guardians[1].address,
        ]);

        const setThresholdData = lsp11Contract.interface.encodeFunctionData(
          'setGuardiansThreshold',
          [accounts.account1.address, 2],
        );

        const secretHashData = lsp11Contract.interface.encodeFunctionData('setRecoverySecretHash', [
          accounts.account1.address,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('secret')),
        ]);

        // Execute batch calls
        await lsp11Contract
          .connect(accounts.account1)
          .batchCalls([addGuardian1Data, addGuardian2Data, setThresholdData, secretHashData]);

        // Validate the results
        const isGuardian1 = await lsp11Contract.isGuardianOf(
          accounts.account1.address,
          accounts.guardians[0].address,
        );
        const isGuardian2 = await lsp11Contract.isGuardianOf(
          accounts.account1.address,
          accounts.guardians[1].address,
        );
        const threshold = await lsp11Contract.getGuardiansThresholdOf(accounts.account1.address);
        const storedSecretHash = await lsp11Contract.getSecretHashOf(accounts.account1.address);

        expect(isGuardian1).to.be.true;
        expect(isGuardian2).to.be.true;
        expect(threshold).to.equal(2);
        expect(storedSecretHash).to.equal(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('secret')),
        );
      });

      it('should revert if one of the batch calls fails', async () => {
        const { lsp11Contract, accounts } = context;

        const addGuardian1Data = lsp11Contract.interface.encodeFunctionData('addGuardian', [
          accounts.account1.address,
          accounts.guardians[0].address,
        ]);
        const invalidData = '0xdeadbeef'; // Some invalid data to cause the batch call to fail

        // Execute batch calls
        await expect(
          lsp11Contract.connect(accounts.account1).batchCalls([addGuardian1Data, invalidData]),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'BatchCallsFailed')
          .withArgs(1);
      });
    });

    describe('Guardian Voting', () => {
      it('Guardian cannot vote for an account where they are not a guardian', async () => {
        const { lsp11Contract, accounts } = context;

        // Guardian1 tries to vote for Account1 without being its guardian
        await expect(
          lsp11Contract
            .connect(accounts.guardians[0])
            .voteForRecoverer(
              accounts.account1.address,
              accounts.guardians[0].address,
              accounts.votedAddresses[0].address,
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'CallerIsNotAGuardianOfTheAccount')
          .withArgs(accounts.account1.address, accounts.guardians[0].address);
      });

      it('Guardian cannot vote for the same address twice', async () => {
        const { lsp11Contract, accounts } = context;

        // Add Guardian1 as a guardian for Account1
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        // Guardian1 votes for VotedAddress1
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        // Guardian1 tries to vote for VotedAddress1 again
        await expect(
          lsp11Contract
            .connect(accounts.guardians[0])
            .voteForRecoverer(
              accounts.account1.address,
              accounts.guardians[0].address,
              accounts.votedAddresses[0].address,
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'CannotVoteToAddressTwice')
          .withArgs(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
      });

      it('Guardian can vote for an account recovery', async () => {
        const { lsp11Contract, accounts } = context;
        const recoveryCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        // Account1 adds Guardian1
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        // Guardian1 votes for VotedAddress1 for Account1's recovery
        await expect(
          lsp11Contract
            .connect(accounts.guardians[0])
            .voteForRecoverer(
              accounts.account1.address,
              accounts.guardians[0].address,
              accounts.votedAddresses[0].address,
            ),
        )
          .to.emit(lsp11Contract, 'GuardianVotedFor')
          .withArgs(
            accounts.account1.address,
            recoveryCounter,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        const guardianVote = await lsp11Contract.getAddressVotedByGuardian(
          accounts.account1.address,
          recoveryCounter,
          accounts.guardians[0].address,
        );
        const votesForVotedAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          accounts.account1.address,
          recoveryCounter,
          accounts.votedAddresses[0].address,
        );

        expect(guardianVote).to.equal(accounts.votedAddresses[0].address);
        expect(votesForVotedAddress).to.equal(1);
      });

      it('Guardian can change their vote for an account recovery', async () => {
        const { lsp11Contract, accounts } = context;
        const recoveryCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        // Account1 adds Guardian1
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        // Guardian1 votes for VotedAddress1 for Account1's recovery
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        // Guardian1 changes vote to VotedAddress2
        await expect(
          lsp11Contract
            .connect(accounts.guardians[0])
            .voteForRecoverer(
              accounts.account1.address,
              accounts.guardians[0].address,
              accounts.votedAddresses[1].address,
            ),
        )
          .to.emit(lsp11Contract, 'GuardianVotedFor')
          .withArgs(
            accounts.account1.address,
            recoveryCounter,
            accounts.guardians[0].address,
            accounts.votedAddresses[1].address,
          );

        const guardianVote = await lsp11Contract.getAddressVotedByGuardian(
          accounts.account1.address,
          recoveryCounter,
          accounts.guardians[0].address,
        );
        const votesForVotedAddress1 = await lsp11Contract.getVotesOfGuardianVotedAddress(
          accounts.account1.address,
          recoveryCounter,
          accounts.votedAddresses[0].address,
        );
        const votesForVotedAddress2 = await lsp11Contract.getVotesOfGuardianVotedAddress(
          accounts.account1.address,
          recoveryCounter,
          accounts.votedAddresses[1].address,
        );

        expect(guardianVote).to.equal(accounts.votedAddresses[1].address);
        expect(votesForVotedAddress1).to.equal(0);
        expect(votesForVotedAddress2).to.equal(1);
      });

      it('Guardian can reset their vote for an account recovery', async () => {
        const { lsp11Contract, accounts } = context;
        const recoveryCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        // Account1 adds Guardian1
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        // Guardian1 votes for VotedAddress1 for Account1's recovery
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        // Guardian1 resets vote
        await expect(
          lsp11Contract
            .connect(accounts.guardians[0])
            .voteForRecoverer(
              accounts.account1.address,
              accounts.guardians[0].address,
              ethers.constants.AddressZero,
            ),
        )
          .to.emit(lsp11Contract, 'GuardianVotedFor')
          .withArgs(
            accounts.account1.address,
            recoveryCounter,
            accounts.guardians[0].address,
            ethers.constants.AddressZero,
          );

        const guardianVote = await lsp11Contract.getAddressVotedByGuardian(
          accounts.account1.address,
          recoveryCounter,
          accounts.guardians[0].address,
        );
        const votesForVotedAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          accounts.account1.address,
          recoveryCounter,
          accounts.votedAddresses[0].address,
        );
        const votesForAddressZero = await lsp11Contract.getVotesOfGuardianVotedAddress(
          accounts.account1.address,
          recoveryCounter,
          ethers.constants.AddressZero,
        );

        expect(guardianVote).to.equal(ethers.constants.AddressZero);
        expect(votesForVotedAddress).to.equal(0);
        expect(votesForAddressZero).to.equal(0);
      });
    });

    describe('Commitment Management', () => {
      it('Account can commit a plain secret', async () => {
        const { lsp11Contract, accounts } = context;

        const commitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'secret',
        );

        const recoveryCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .commitPlainSecret(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              commitment,
            ),
        )
          .to.emit(lsp11Contract, 'PlainSecretCommitted')
          .withArgs(
            accounts.account1.address,
            recoveryCounter,
            accounts.votedAddresses[0].address,
            commitment,
          );
      });
    });

    describe('Recovery Process', () => {
      it('Voted address cannot recover access if they did not reach the threshold', async () => {
        const { lsp11Contract, accounts } = context;

        // Add Guardian1 and Guardian2 as guardians for Account1 and set threshold to 2
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);

        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);

        // Only Guardian1 votes for VotedAddress1
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        // VotedAddress1 tries to recover access but should fail
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .recoverAccess(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('secret')),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              '0x',
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'CallerVotesHaveNotReachedThreshold')
          .withArgs(accounts.account1.address, accounts.votedAddresses[0].address);
      });

      it('Voted address cannot recover access if they did not make a valid commitment', async () => {
        const { lsp11Contract, accounts } = context;

        const saltedSecretHash = generateSaltedSecretHash(accounts.account1.address, 'secret');
        const invalidCommitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'notSecret',
        );

        // Add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);

        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);

        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, saltedSecretHash);

        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .commitPlainSecret(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            invalidCommitment,
          );

        const secretHash = generateSecretHash('secret');

        // VotedAddress1 tries to recover access without making a commitment
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .recoverAccess(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              secretHash,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              '0x',
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'InvalidCommitment')
          .withArgs(accounts.account1.address, accounts.votedAddresses[0].address);
      });

      it('Voted address cannot recover access if the secret hash is wrong', async () => {
        const { lsp11Contract, accounts } = context;
        const saltedSecretHash = generateSaltedSecretHash(accounts.account1.address, 'secretA');

        // Set secret hash, add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, saltedSecretHash);

        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);

        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);

        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);

        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );

        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        const validCommitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'secretB',
        );

        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .commitPlainSecret(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            validCommitment,
          );

        const invalidSecretHash = generateSecretHash('secretB');

        // VotedAddress1 tries to recover access with wrong secret
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .recoverAccess(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              invalidSecretHash,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              '0x',
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'InvalidSecretHash')
          .withArgs(accounts.account1.address, invalidSecretHash);
      });

      it('Voted address can recover access given the correct parameters', async () => {
        const { lsp11Contract, accounts } = context;
        const saltedSecretHash = generateSaltedSecretHash(accounts.account1.address, 'secret');

        // Set secret hash, add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, saltedSecretHash);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);
        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        const validCommitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'secret',
        );

        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .commitPlainSecret(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            validCommitment,
          );

        const recoveryCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        const secretHash = generateSecretHash('secret');

        // VotedAddress1 recovers access with correct secret
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .recoverAccess(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              secretHash,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NewSecret')),
              '0x',
            ),
        )
          .to.emit(lsp11Contract, 'RecoveryProcessSuccessful')
          .withArgs(accounts.account1.address, recoveryCounter, accounts.votedAddresses[0].address);

        const storedSecretHash = await lsp11Contract.getSecretHashOf(accounts.account1.address);
        expect(storedSecretHash).to.equal(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NewSecret')),
        );
      });

      it('The recovery counter is incremented after a valid recovery process', async () => {
        const { lsp11Contract, accounts } = context;
        const saltedSecretHash = generateSaltedSecretHash(accounts.account1.address, 'secret');

        // Set secret hash, add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, saltedSecretHash);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);
        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        const initialCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);

        const validCommitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'secret',
        );

        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .commitPlainSecret(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            validCommitment,
          );

        const secretHash = generateSecretHash('secret');

        // VotedAddress1 recovers access with correct secret
        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .recoverAccess(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            secretHash,
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NotSecret')),
            '0x',
          );

        const newCounter = await lsp11Contract.getRecoveryCounterOf(accounts.account1.address);
        expect(newCounter).to.equal(initialCounter.add(1));
      });

      it('Cannot recover in case of no secret and no guardians', async () => {
        const { lsp11Contract, accounts } = context;

        // VotedAddress1 tries to recover access but should fail
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[0])
            .recoverAccess(
              accounts.account1.address,
              accounts.votedAddresses[0].address,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('secret')),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              '0x',
            ),
        ).to.be.revertedWithCustomError(lsp11Contract, 'AccountNotSetupYet');
      });
    });

    describe('Historical Data and Recovery Cancellation', () => {
      it('Account can cancel the recovery process', async () => {
        const { lsp11Contract, accounts } = context;
        const secret = 'secret';
        const secretHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secret));

        // Set secret hash, add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, secretHash);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);
        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        const oldRecoveryCounter = await lsp11Contract.getRecoveryCounterOf(
          accounts.account1.address,
        );

        // Account1 cancels the recovery process
        await expect(
          lsp11Contract.connect(accounts.account1).cancelRecoveryProcess(accounts.account1.address),
        )
          .to.emit(lsp11Contract, 'RecoveryCancelled')
          .withArgs(accounts.account1.address, oldRecoveryCounter);

        const newRecoveryCounter = await lsp11Contract.getRecoveryCounterOf(
          accounts.account1.address,
        );

        const votedForAddress = await lsp11Contract.getAddressVotedByGuardian(
          accounts.account1.address,
          newRecoveryCounter,
          accounts.guardians[0].address,
        );
        expect(votedForAddress).to.equal(ethers.constants.AddressZero);
        expect(newRecoveryCounter).to.equal(oldRecoveryCounter.add(1));
      });

      it('Historical data can be tracked by checking the data of old recovery processes', async () => {
        const { lsp11Contract, accounts } = context;
        const saltedSecretHash = generateSaltedSecretHash(accounts.account1.address, 'secret');

        // Set secret hash, add two guardians, set threshold to 2, and both vote for VotedAddress1
        await lsp11Contract
          .connect(accounts.account1)
          .setRecoverySecretHash(accounts.account1.address, saltedSecretHash);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[0].address);
        await lsp11Contract
          .connect(accounts.account1)
          .addGuardian(accounts.account1.address, accounts.guardians[1].address);
        await lsp11Contract
          .connect(accounts.account1)
          .setGuardiansThreshold(accounts.account1.address, 2);
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
        await lsp11Contract
          .connect(accounts.guardians[1])
          .voteForRecoverer(
            accounts.account1.address,
            accounts.guardians[1].address,
            accounts.votedAddresses[0].address,
          );

        const validCommitment = generateCommitment(
          accounts.votedAddresses[0].address,
          accounts.account1.address,
          'secret',
        );

        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .commitPlainSecret(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            validCommitment,
          );

        const secretHash = generateSecretHash('secret');
        const oldRecoveryCounter = await lsp11Contract.getRecoveryCounterOf(
          accounts.account1.address,
        );

        // Account1 initiates the recovery process
        await lsp11Contract
          .connect(accounts.votedAddresses[0])
          .recoverAccess(
            accounts.account1.address,
            accounts.votedAddresses[0].address,
            secretHash,
            generateSaltedSecretHash(accounts.account1.address, 'newsecret'),
            '0x',
          );

        const newRecoveryCounter = await lsp11Contract.getRecoveryCounterOf(
          accounts.account1.address,
        );

        const votedForAddress = await lsp11Contract.getAddressVotedByGuardian(
          accounts.account1.address,
          oldRecoveryCounter,
          accounts.guardians[0].address,
        );
        expect(votedForAddress).to.equal(accounts.votedAddresses[0].address);
        expect(newRecoveryCounter).to.equal(1);
      });
    });
  });
});
