import { expect } from 'chai';
import { UniversalReceiverTester__factory } from '../types/ethers-contracts/index.js';
import { UniversalProfile__factory } from '../../universalprofile-contracts/types/ethers-contracts/index.js';

import {
  type LSP1TestContext,
  shouldBehaveLikeLSP1,
} from './LSP1UniversalReceiver/LSP1UniversalReceiver.behaviour.js';

import {
  type LSP17TestContext,
  shouldBehaveLikeLSP17,
} from './LSP17ContractExtension/LSP17Extendable.behaviour.js';

import {
  type LSP20TestContext,
  shouldBehaveLikeLSP20,
} from './LSP20CallVerification/LSP20CallVerification.behaviour.js';

import {
  type LSP3TestContext,
  shouldInitializeLikeLSP3,
  shouldBehaveLikeLSP3,
} from './UniversalProfile.behaviour.js';
import {
  type LSP14CombinedWithLSP20TestContext,
  shouldBehaveLikeLSP14WithLSP20,
} from './LSP20CallVerification/LSP20WithLSP14.behaviour.js';
import { network } from 'hardhat';

describe('UniversalProfile with constructor', () => {
  const buildLSP3TestContext = async (initialFunding?: number): Promise<LSP3TestContext> => {
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
      initialFunding,
    };
    const universalProfile = await new UniversalProfile__factory(accounts[0]).deploy(
      deployParams.owner.address,
      {
        value: initialFunding,
      },
    );

    await universalProfile.waitForDeployment();

    return { ethers, networkHelpers, accounts, universalProfile, deployParams };
  };

  const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();

    const lsp1Implementation = await new UniversalProfile__factory(accounts[0]).deploy(
      accounts[0].address,
    );

    const lsp1Checker = await new UniversalReceiverTester__factory(accounts[0]).deploy();

    return { ethers, networkHelpers, accounts, lsp1Implementation, lsp1Checker };
  };

  const buildLSP14WithLSP20TestContext = async (
    initialFunding?: number | bigint,
  ): Promise<LSP14CombinedWithLSP20TestContext> => {
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
      initialFunding,
    };

    const contract = await new UniversalProfile__factory(accounts[0]).deploy(
      deployParams.owner.address,
      { value: initialFunding },
    );

    const onlyOwnerCustomError = 'OwnableCallerNotTheOwner';

    return { ethers, networkHelpers, accounts, contract, deployParams, onlyOwnerCustomError };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };
    const contract = await new UniversalProfile__factory(accounts[0]).deploy(
      deployParams.owner.address,
    );

    // TODO: fix typing here, ensure if we pass `HardhatEthersSigner` or `string`
    return { ethers, accounts, contract, deployParams };
  };

  const buildLSP20TestContext = async (): Promise<LSP20TestContext> => {
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };
    const universalProfile = await new UniversalProfile__factory(accounts[0]).deploy(
      deployParams.owner.address,
    );

    return { accounts, universalProfile, deployParams };
  };

  [{ initialFunding: undefined }, { initialFunding: 0 }, { initialFunding: 5 }].forEach(
    (testCase) => {
      describe('when deploying the contract with or without value', () => {
        let context: LSP3TestContext;

        before(async () => {
          context = await buildLSP3TestContext(testCase.initialFunding);
        });

        it(`should have deployed with the correct funding amount (${testCase.initialFunding})`, async () => {
          const balance = await context.ethers.provider.getBalance(
            await context.universalProfile.getAddress(),
          );
          expect(balance).to.equal(testCase.initialFunding || 0);
        });
      });
    },
  );

  describe('when deploying the contract', () => {
    let context: LSP3TestContext;

    before(async () => {
      context = await buildLSP3TestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP3(async () => context);
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP3(buildLSP3TestContext);
    shouldBehaveLikeLSP1(buildLSP1TestContext);
    shouldBehaveLikeLSP14WithLSP20(buildLSP14WithLSP20TestContext);
    shouldBehaveLikeLSP17(buildLSP17TestContext);
    shouldBehaveLikeLSP20(buildLSP20TestContext);
  });
});
