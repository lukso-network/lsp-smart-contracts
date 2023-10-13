import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  LSP11UniversalSocialRecovery__factory,
  LSP11UniversalSocialRecovery,
  UniversalProfile,
  LSP6KeyManager,
} from '../../../types';

import {
  setupProfileWithKeyManagerWithURD,
  grantLSP11PermissionViaKeyManager,
} from '../../utils/fixtures';

import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { OPERATION_TYPES } from '../../../constants';

type UniversalSocialRecoveryTestAccounts = {
  mainController: SignerWithAddress;
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
    mainController,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
    votedAddress1,
    votedAddress2,
    votedAddress3,
  ] = await ethers.getSigners();

  return {
    mainController,
    guardians: [guardian1, guardian2, guardian3, guardian4],
    votedAddresses: [votedAddress1, votedAddress2, votedAddress3],
  };
};

type UniversalSocialRecoveryWithLSP0xLSP6TestContext = {
  accounts: UniversalSocialRecoveryTestAccounts;
  lsp11Contract: LSP11UniversalSocialRecovery;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

describe('LSP11UniversalSocialRecovery', () => {
  const buildTestContext = async (): Promise<UniversalSocialRecoveryWithLSP0xLSP6TestContext> => {
    const accounts = await getNamedAccounts();

    const [UP, KM] = await setupProfileWithKeyManagerWithURD(accounts.mainController);

    const universalProfile = UP as UniversalProfile;
    const lsp6KeyManager = KM as LSP6KeyManager;

    const lsp11Contract = await new LSP11UniversalSocialRecovery__factory(
      accounts.mainController,
    ).deploy();

    await grantLSP11PermissionViaKeyManager(
      accounts.mainController,
      universalProfile,
      lsp6KeyManager,
      lsp11Contract.address,
    );

    return {
      accounts,
      lsp11Contract,
      universalProfile,
      lsp6KeyManager,
    };
  };

  describe('When using LSP11UniversalSocialRecovery with LSP0 and LSP6', () => {
    let context: UniversalSocialRecoveryWithLSP0xLSP6TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('Guardian Addition via UniversalProfile', () => {
      it('universalprofile can add guardian to lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        // Encode the addGuardian function call
        const addGuardianData = lsp11Contract.interface.encodeFunctionData('addGuardian', [
          universalProfile.address,
          accounts.guardians[0].address,
        ]);

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, addGuardianData),
        )
          .to.emit(lsp11Contract, 'GuardianAdded')
          .withArgs(universalProfile.address, accounts.guardians[0].address);

        // Check the state change
        const isGuardian = await lsp11Contract.isGuardianOf(
          universalProfile.address,
          accounts.guardians[0].address,
        );
        expect(isGuardian).to.be.true;
      });
    });

    describe('Guardian Removal via UniversalProfile', () => {
      it('universalprofile can remove guardian from lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        // Encode the removeGuardian function call
        const removeGuardianData = lsp11Contract.interface.encodeFunctionData('removeGuardian', [
          universalProfile.address,
          accounts.guardians[0].address,
        ]);

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, removeGuardianData),
        )
          .to.emit(lsp11Contract, 'GuardianRemoved')
          .withArgs(universalProfile.address, accounts.guardians[0].address);

        // Check the state change
        const isGuardian = await lsp11Contract.isGuardianOf(
          universalProfile.address,
          accounts.guardians[0].address,
        );
        expect(isGuardian).to.be.false;
      });
    });

    describe('Secret Guardian Addition via UniversalProfile', () => {
      it('universalprofile can add a secret guardian to lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        const secretGuardianHash = generateSecretGuardian(
          universalProfile.address,
          accounts.guardians[2].address,
        );

        // Encode the addSecretGuardian function call
        const addSecretGuardianData = lsp11Contract.interface.encodeFunctionData(
          'addSecretGuardian',
          [universalProfile.address, secretGuardianHash],
        );

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, addSecretGuardianData),
        )
          .to.emit(lsp11Contract, 'SecretGuardianAdded')
          .withArgs(universalProfile.address, secretGuardianHash);

        // Check the state change
        const isSecretGuardian = await lsp11Contract.isSecretGuardianOf(
          universalProfile.address,
          secretGuardianHash,
        );
        expect(isSecretGuardian).to.be.true;
      });
    });

    describe('Guardian Addition via UniversalProfile', () => {
      it('universalprofile can add guardian to lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        // Encode the addGuardian function call
        const addGuardianData = lsp11Contract.interface.encodeFunctionData('addGuardian', [
          universalProfile.address,
          accounts.guardians[0].address,
        ]);

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, addGuardianData),
        )
          .to.emit(lsp11Contract, 'GuardianAdded')
          .withArgs(universalProfile.address, accounts.guardians[0].address);

        // Check the state change
        const isGuardian = await lsp11Contract.isGuardianOf(
          universalProfile.address,
          accounts.guardians[0].address,
        );
        expect(isGuardian).to.be.true;
      });
    });

    describe('Threshold Modification via UniversalProfile', () => {
      it('universalprofile can change threshold in lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        const newThreshold = 2;

        // Encode the setGuardiansThreshold function call
        const setGuardiansThresholdData = lsp11Contract.interface.encodeFunctionData(
          'setGuardiansThreshold',
          [universalProfile.address, newThreshold],
        );

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, setGuardiansThresholdData),
        )
          .to.emit(lsp11Contract, 'GuardiansThresholdChanged')
          .withArgs(universalProfile.address, newThreshold);

        // Check the state change
        const storedThreshold = await lsp11Contract.getGuardiansThresholdOf(
          universalProfile.address,
        );
        expect(storedThreshold).to.equal(newThreshold);
      });
    });

    describe('Setting Salted SecretHash via UniversalProfile', () => {
      it('universalprofile can set a salted secretHash to lsp11 and expect event and state change', async () => {
        const { universalProfile, accounts, lsp11Contract } = context;

        const secret = 'mySecret';
        const saltedSecretHash = generateSaltedSecretHash(universalProfile.address, secret);

        // Encode the setRecoverySecretHash function call
        const setRecoverySecretHashData = lsp11Contract.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [universalProfile.address, saltedSecretHash],
        );

        // Execute the function via UniversalProfile
        await expect(
          universalProfile
            .connect(accounts.mainController)
            .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, setRecoverySecretHashData),
        )
          .to.emit(lsp11Contract, 'SecretHashChanged')
          .withArgs(universalProfile.address, saltedSecretHash);

        // Check the state change
        const storedSecretHash = await lsp11Contract.getSecretHashOf(universalProfile.address);
        expect(storedSecretHash).to.equal(saltedSecretHash);
      });
    });

    describe('Guardian Voting', () => {
      it('non-guardian is not allowed to vote', async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Non-guardian tries to vote
        await expect(
          lsp11Contract
            .connect(accounts.votedAddresses[1]) // Assuming this is a non-guardian
            .voteForRecoverer(
              universalProfile.address,
              accounts.votedAddresses[1].address,
              accounts.votedAddresses[0].address,
            ),
        ).to.be.revertedWithCustomError(lsp11Contract, 'CallerIsNotAGuardianOfTheAccount');
      });

      it('secret guardian can vote', async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Assuming accounts.guardians[2] is a secret guardian
        const secretGuardian = accounts.guardians[2];

        // Secret guardian votes
        await expect(
          lsp11Contract
            .connect(secretGuardian)
            .voteForRecoverer(
              universalProfile.address,
              secretGuardian.address,
              accounts.votedAddresses[0].address,
            ),
        )
          .to.emit(lsp11Contract, 'GuardianVotedFor')
          .withArgs(
            universalProfile.address,
            0,
            secretGuardian.address,
            accounts.votedAddresses[0].address,
          );

        // Check the mapping for guardian's choice
        const guardianChoice = await lsp11Contract.getAddressVotedByGuardian(
          universalProfile.address,
          0,
          secretGuardian.address,
        );

        expect(guardianChoice).to.equal(accounts.votedAddresses[0].address);

        // Check the mapping for the number of votes for the address voted for
        const votesForAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          universalProfile.address,
          0,
          accounts.votedAddresses[0].address,
        );
        expect(votesForAddress).to.equal(1);
      });

      it('secret guardian can change his vote', async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Assuming accounts.guardians[2] is a secret guardian
        const secretGuardian = accounts.guardians[2];

        // Secret guardian changes his vote to a different voted address
        await expect(
          lsp11Contract
            .connect(secretGuardian)
            .voteForRecoverer(
              universalProfile.address,
              secretGuardian.address,
              accounts.votedAddresses[1].address,
            ),
        )
          .to.emit(lsp11Contract, 'GuardianVotedFor')
          .withArgs(
            universalProfile.address,
            0,
            secretGuardian.address,
            accounts.votedAddresses[1].address,
          );

        // Check the mapping for guardian's new choice
        const newGuardianChoice = await lsp11Contract.getAddressVotedByGuardian(
          universalProfile.address,
          0,
          secretGuardian.address,
        );
        expect(newGuardianChoice).to.equal(accounts.votedAddresses[1].address);

        // Check the mapping for the number of votes for the new address voted for
        const newVotesForAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          universalProfile.address,
          0,
          accounts.votedAddresses[1].address,
        );
        expect(newVotesForAddress).to.equal(1);

        // Check the mapping for the number of votes for the old address to ensure it decreased
        const oldVotesForAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          universalProfile.address,
          0,
          accounts.votedAddresses[0].address,
        );
        expect(oldVotesForAddress).to.equal(0);
      });
    });

    describe('Recovery Attempt Before Reaching Threshold', () => {
      it('voted address cannot recover with valid secret due to not reaching threshold', async () => {
        const { accounts, lsp11Contract, universalProfile } = context;

        // Assuming accounts.votedAddresses[0] is the voted address
        const votedAddress = accounts.votedAddresses[1];

        // Voted address tries to recover
        const secretHash = generateSecretHash('secret'); // Assuming 'secret' is the correct secret
        await expect(
          lsp11Contract
            .connect(votedAddress)
            .recoverAccess(
              universalProfile.address,
              votedAddress.address,
              secretHash,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              '0x',
            ),
        )
          .to.be.revertedWithCustomError(lsp11Contract, 'CallerVotesHaveNotReachedThreshold')
          .withArgs(universalProfile.address, votedAddress.address);
      });
    });

    describe('Voting to Reach Threshold', () => {
      it('additional guardians vote to help voted address reach threshold', async () => {
        const { accounts, lsp11Contract, universalProfile } = context;

        // Assuming accounts.votedAddresses[0] is the voted address
        const votedAddress = accounts.votedAddresses[1];

        // Additional guardians vote for the voted address
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            universalProfile.address,
            accounts.guardians[0].address,
            votedAddress.address,
          );

        // Check the mapping for the number of votes for the address voted for
        const votesForAddress = await lsp11Contract.getVotesOfGuardianVotedAddress(
          universalProfile.address,
          0,
          votedAddress.address,
        );
        expect(votesForAddress).to.equal(2); // Assuming secret guardian already voted, so total is 3
      });
    });

    describe('Successful Recovery and Transfer Ownership', () => {
      it('voted address makes a valid commitment', async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Assuming accounts.votedAddresses[1] is the voted address that will make the commitment
        const votedAddress = accounts.votedAddresses[1];

        // Generate a valid commitment
        const validCommitment = generateCommitment(
          votedAddress.address,
          universalProfile.address,
          'mySecret',
        );

        // Voted address makes a valid commitment
        await expect(
          lsp11Contract
            .connect(votedAddress)
            .commitPlainSecret(universalProfile.address, votedAddress.address, validCommitment),
        )
          .to.emit(lsp11Contract, 'PlainSecretCommitted')
          .withArgs(universalProfile.address, 0, votedAddress.address, validCommitment);

        // Check the commitment in the storage
        const storedCommitment = await lsp11Contract.getCommitmentOf(
          universalProfile.address,
          0,
          votedAddress.address,
        );
        expect(storedCommitment).to.equal(validCommitment);
      });
      it('voted address recovers and initiates a transfer ownership', async () => {
        const { accounts, lsp11Contract, universalProfile } = context;

        // Assuming accounts.votedAddresses[1] is the voted address that will recover
        const votedAddress = accounts.votedAddresses[1];

        // Encode the transferOwnership function call (assuming UniversalProfile has this function)
        const transferOwnershipData = universalProfile.interface.encodeFunctionData(
          'transferOwnership',
          [votedAddress.address],
        );

        // Voted address tries to recover with the correct secret and initiates a transfer ownership
        const secretHash = generateSecretHash('mySecret');
        await expect(
          lsp11Contract
            .connect(votedAddress)
            .recoverAccess(
              universalProfile.address,
              votedAddress.address,
              secretHash,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('newsecret')),
              transferOwnershipData,
            ),
        )
          .to.emit(lsp11Contract, 'RecoveryProcessSuccessful')
          .withArgs(universalProfile.address, 0, votedAddress.address)
          .and.to.emit(universalProfile, 'OwnershipTransferStarted');

        // Check the new owner of the UniversalProfile
        const newOwner = await universalProfile.pendingOwner();
        expect(newOwner).to.equal(votedAddress.address);
      });
    });

    describe('Recovery without a secret using setData payload', () => {
      before(async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Remove the secret hash
        const removeSecretHash = lsp11Contract.interface.encodeFunctionData(
          'setRecoverySecretHash',
          [universalProfile.address, ethers.constants.HashZero],
        );

        // Execute the batch of function calls via UniversalProfile
        await universalProfile
          .connect(accounts.mainController)
          .execute(OPERATION_TYPES.CALL, lsp11Contract.address, 0, removeSecretHash);

        // Guardians vote for a specific address
        await lsp11Contract
          .connect(accounts.guardians[0])
          .voteForRecoverer(
            universalProfile.address,
            accounts.guardians[0].address,
            accounts.votedAddresses[0].address,
          );
        await lsp11Contract
          .connect(accounts.guardians[2])
          .voteForRecoverer(
            universalProfile.address,
            accounts.guardians[2].address,
            accounts.votedAddresses[0].address,
          );
      });

      it('voted address recovers without a secret and sets data', async () => {
        const { accounts, universalProfile, lsp11Contract } = context;

        // Define the data key and value for setData
        const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('sampleKey'));
        const dataValue = '0xaabbccdd';

        // Encode the setData function call
        const setDataPayload = universalProfile.interface.encodeFunctionData('setData', [
          dataKey,
          dataValue,
        ]);

        // Voted address recovers without a secret and sets data
        await lsp11Contract.connect(accounts.votedAddresses[0]).recoverAccess(
          universalProfile.address,
          accounts.votedAddresses[0].address,
          ethers.constants.HashZero, // No secret
          ethers.constants.HashZero, // No new secret
          setDataPayload,
        );

        // Check the state change
        const storedDataValue = await universalProfile.getData(dataKey);
        expect(storedDataValue).to.equal(dataValue);
      });
    });
  });
});
