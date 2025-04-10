import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  ContractFactory,
  ContractTransactionResponse,
  getAddress,
  hexlify,
  randomBytes,
} from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { writeFileSync } from 'fs';

import LSP0ER725AccountArtifacts from '../artifacts/@lukso/lsp0-contracts/contracts/LSP0ERC725Account.sol/LSP0ERC725Account.json';
import LSP26FollowerSystemArtifacts from '../artifacts/contracts/LSP26FollowerSystem.sol/LSP26FollowerSystem.json';

import RevertOnFollowArtifacts from '../artifacts/contracts/mock/RevertOnFollow.sol/RevertOnFollow.json';
import ReturnBombArtifacts from '../artifacts/contracts/mock/ReturnBomb.sol/ReturnBomb.json';
import SelfDestructOnInterfaceCheckArtifacts from '../artifacts/contracts/mock/SelfDestructOnInterfaceCheck.sol/SelfDestructOnInterfaceCheck.json';
import InfiniteLoopURDArtifacts from '../artifacts/contracts/mock/InfiniteLoopURD.sol/InfiniteLoopURD.json';

// constants
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';

const LSP26FollowerSystem__factory = new ContractFactory(
  LSP26FollowerSystemArtifacts.abi,
  LSP26FollowerSystemArtifacts.bytecode,
);

const LSP0ERC725Account__factory = new ContractFactory(
  LSP0ER725AccountArtifacts.abi,
  LSP0ER725AccountArtifacts.bytecode,
);

const RevertOnFollow__factory = new ContractFactory(
  RevertOnFollowArtifacts.abi,
  RevertOnFollowArtifacts.bytecode,
);
const ReturnBomb__factory = new ContractFactory(
  ReturnBombArtifacts.abi,
  ReturnBombArtifacts.bytecode,
);
const SelfDestructOnInterfaceCheck__factory = new ContractFactory(
  SelfDestructOnInterfaceCheckArtifacts.abi,
  SelfDestructOnInterfaceCheckArtifacts.bytecode,
);
const InfiniteLoopURD__factory = new ContractFactory(
  InfiniteLoopURDArtifacts.abi,
  InfiniteLoopURDArtifacts.bytecode,
);

describe('testing `LSP26FollowerSystem`', () => {
  let context: {
    followerSystem;
    followerSystemAddress: string;
    revertOnFollow;
    revertOnFollowAddress: string;
    universalProfile;
    owner: SignerWithAddress;
    singleFollowSigner: SignerWithAddress;
    executeBatchFollowSigners: SignerWithAddress[];
    batchFollowSigners: SignerWithAddress[];
    multiFollowSigners: SignerWithAddress[];
  };

  before(async () => {
    const signers = await ethers.getSigners();
    const [owner, singleFollowSigner] = signers;
    const followerSystem = await LSP26FollowerSystem__factory.connect(signers[0]).deploy();
    const followerSystemAddress = await followerSystem.getAddress();
    const universalProfile = await LSP0ERC725Account__factory.connect(owner).deploy(owner.address);

    const revertOnFollow = await RevertOnFollow__factory.connect(signers[0]).deploy();
    const revertOnFollowAddress = await revertOnFollow.getAddress();

    const executeBatchFollowSigners = signers.slice(2, 12);
    const batchFollowSigners = signers.slice(12, 22);
    const multiFollowSigners = signers.slice(22, 10_022);

    context = {
      followerSystem,
      followerSystemAddress,
      revertOnFollow,
      revertOnFollowAddress,
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

    it('should not revert if follow recipient reverts inside the LSP1 hook', async () => {
      await context.followerSystem.connect(context.owner).follow(context.revertOnFollowAddress);

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          context.revertOnFollowAddress,
        ),
      ).to.be.true;
    });
  });

  describe('testing `unfollow(address)`', () => {
    it('should revert when unfollowing your own address', async () => {
      await expect(context.followerSystem.connect(context.owner).unfollow(context.owner.address))
        .to.be.revertedWithCustomError(context.followerSystem, 'LSP26NotFollowing')
        .withArgs(context.owner.address);
    });

    it('should revert when unfollowing an address that is not followed', async () => {
      const randomAddress = getAddress(hexlify(randomBytes(20)));

      await expect(context.followerSystem.connect(context.owner).unfollow(randomAddress))
        .to.be.revertedWithCustomError(context.followerSystem, 'LSP26NotFollowing')
        .withArgs(randomAddress);
    });

    it('should not revert if unfollow recipient reverts inside the LSP1 hook', async () => {
      await context.followerSystem.connect(context.owner).unfollow(context.revertOnFollowAddress);

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          context.revertOnFollowAddress,
        ),
      ).to.be.false;
    });
  });

  describe('testing follow/unfollow a contract that self destructs on interface check', async () => {
    let selfDestruct;

    before(async () => {
      selfDestruct = await SelfDestructOnInterfaceCheck__factory.connect(context.owner).deploy();
    });

    it('should pass following', async () => {
      await context.followerSystem.connect(context.owner).follow(await selfDestruct.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await selfDestruct.getAddress(),
        ),
      ).to.be.true;
    });

    it('should pass unfollowing', async () => {
      await context.followerSystem.connect(context.owner).unfollow(await selfDestruct.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await selfDestruct.getAddress(),
        ),
      ).to.be.false;
    });
  });

  describe('testing follow/unfollow a contract with return bomb', () => {
    let returnBomb;

    before(async () => {
      returnBomb = await ReturnBomb__factory.connect(context.owner).deploy();
    });

    it('should pass following', async () => {
      await context.followerSystem.connect(context.owner).follow(await returnBomb.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await returnBomb.getAddress(),
        ),
      ).to.be.true;
    });

    it('should pass unfollowing', async () => {
      await context.followerSystem.connect(context.owner).unfollow(await returnBomb.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await returnBomb.getAddress(),
        ),
      ).to.be.false;
    });
  });

  describe('testing follow/unfollow a contract that has an infinite loop in urd', () => {
    let infiniteLoop;

    before(async () => {
      infiniteLoop = await InfiniteLoopURD__factory.connect(context.owner).deploy();
    });

    it('should pass following', async () => {
      await context.followerSystem.connect(context.owner).follow(await infiniteLoop.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await infiniteLoop.getAddress(),
        ),
      ).to.be.true;
    });

    it('should pass unfollowing', async () => {
      await context.followerSystem.connect(context.owner).unfollow(await infiniteLoop.getAddress());

      expect(
        await context.followerSystem.isFollowing(
          context.owner.address,
          await infiniteLoop.getAddress(),
        ),
      ).to.be.false;
    });
  });

  describe.skip('gas tests', () => {
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
