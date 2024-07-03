import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractTransactionResponse, getAddress, hexlify, randomBytes } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { writeFileSync } from 'fs';

// constants
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';

// types
import {
  LSP26FollowingSystem,
  LSP26FollowingSystem__factory,
  LSP0ERC725Account,
  LSP0ERC725Account__factory,
} from '../types';

describe('testing `LSP26FollowingSystem`', () => {
  let context: {
    followerSystem: LSP26FollowingSystem;
    followerSystemAddress: string;
    universalProfile: LSP0ERC725Account;
    owner: SignerWithAddress;
    singleFollowSigner: SignerWithAddress;
    executeBatchFollowSigners: SignerWithAddress[];
    batchFollowSigners: SignerWithAddress[];
    multiFollowSigners: SignerWithAddress[];
  };

  before(async () => {
    const signers = await ethers.getSigners();
    const [owner, singleFollowSigner] = signers;
    const followerSystem = await new LSP26FollowingSystem__factory(owner).deploy();
    const followerSystemAddress = await followerSystem.getAddress();
    const universalProfile = await new LSP0ERC725Account__factory(owner).deploy(owner.address);

    const executeBatchFollowSigners = signers.slice(2, 12);
    const batchFollowSigners = signers.slice(12, 22);
    const multiFollowSigners = signers.slice(22, 10_022);

    context = {
      followerSystem,
      followerSystemAddress,
      universalProfile,
      owner,
      singleFollowSigner,
      executeBatchFollowSigners,
      batchFollowSigners,
      multiFollowSigners,
    };
  });

  describe('testing `follow(address)`', () => {
    it('should revert when following your own address', async () => {
      await expect(
        context.followerSystem.connect(context.owner).follow(context.owner.address),
      ).to.be.revertedWithCustomError(context.followerSystem, 'LSP26CannotSelfFollow');
    });

    it('should revert when following an address that is already followed', async () => {
      const randomAddress = getAddress(hexlify(randomBytes(20)));

      await context.followerSystem.connect(context.owner).follow(randomAddress);

      await expect(context.followerSystem.connect(context.owner).follow(randomAddress))
        .to.be.revertedWithCustomError(context.followerSystem, 'LSP26AlreadyFollowing')
        .withArgs(randomAddress);
    });
  });

  describe('testing `unfollow(address)`', () => {
    it('should revert when unfollowing your own address', async () => {
      await expect(
        context.followerSystem.connect(context.owner).unfollow(context.owner.address),
      ).to.be.revertedWithCustomError(context.followerSystem, 'LSP26CannotSelfUnfollow');
    });

    it('should revert when unfollowing an address that is not followed', async () => {
      const randomAddress = getAddress(hexlify(randomBytes(20)));

      await expect(context.followerSystem.connect(context.owner).unfollow(randomAddress))
        .to.be.revertedWithCustomError(context.followerSystem, 'LSP26NotFollowing')
        .withArgs(randomAddress);
    });
  });

  describe('gas tests', () => {
    const gasCostResult: {
      followingGasCost?: number[];
      followCost?: number;
      unfollowCost?: number;
      batchFollowCost?: number;
      executeBatchFollowCost?: number;
    } = {};

    after(() => {
      writeFileSync('gasCost.json', JSON.stringify(gasCostResult));
    });

    it('gas: testing follow', async () => {
      const txResponse = await context.followerSystem
        .connect(context.owner)
        .follow(context.singleFollowSigner.address);
      const txReceipt = await txResponse.wait();

      gasCostResult.followCost = Number(txReceipt.gasUsed);
    });

    it('gas: testing unfollow', async () => {
      const txResponse = await context.followerSystem
        .connect(context.owner)
        .unfollow(context.singleFollowSigner.address);
      const txReceipt = await txResponse.wait();

      gasCostResult.unfollowCost = Number(txReceipt.gasUsed);
    });

    it('gas: testing `followBatch`', async () => {
      const followBatch = context.followerSystem.interface.encodeFunctionData('followBatch', [
        context.batchFollowSigners.map(({ address }) => address),
      ]);

      const txResponse = (await context.universalProfile
        .connect(context.owner)
        .execute(
          OPERATION_TYPES.CALL,
          context.followerSystemAddress,
          0,
          followBatch,
        )) as ContractTransactionResponse;
      const txReceipt = await txResponse.wait();

      gasCostResult.batchFollowCost = Number(txReceipt.gasUsed);
    });

    it('gas: testing `executeBatchFollow`', async () => {
      const follows = context.executeBatchFollowSigners.map(({ address }) =>
        context.followerSystem.interface.encodeFunctionData('follow', [address]),
      );

      const txResponse = (await context.universalProfile.connect(context.owner).executeBatch(
        follows.map(() => OPERATION_TYPES.CALL),
        follows.map(() => context.followerSystemAddress),
        follows.map(() => 0),
        follows,
      )) as ContractTransactionResponse;
      const txReceipt = await txResponse.wait();

      gasCostResult.executeBatchFollowCost = Number(txReceipt.gasUsed);
    });

    describe('gas: testing following a single account 10_000 times', () => {
      const followingGasCost: number[] = [];

      after(() => {
        gasCostResult.followingGasCost = followingGasCost;
      });

      it(`testing signers`, async () => {
        let count = 1;

        for (const signer of context.multiFollowSigners) {
          if (count % 1000 === 0) {
            console.log(`Testing signer #${count}`);
          }

          const txResponse = await context.followerSystem
            .connect(signer)
            .follow(context.owner.address);
          const txReceipt = await txResponse.wait();

          followingGasCost.push(Number(txReceipt.gasUsed));
          count++;
        }
      });
    });
  });
});