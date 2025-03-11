import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  LSP1TestContext,
  shouldBehaveLikeLSP1,
} from './LSP1UniversalReceiver/LSP1UniversalReceiver.behaviour';

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from './LSP17ContractExtension/LSP17Extendable.behaviour';

import {
  LSP20TestContext,
  shouldBehaveLikeLSP20,
} from './LSP20CallVerification/LSP20CallVerification.behaviour';

import {
  LSP3TestContext,
  shouldInitializeLikeLSP3,
  shouldBehaveLikeLSP3,
} from './UniversalProfile.behaviour';
import { provider } from './utils/helpers';
import {
  LSP14CombinedWithLSP20TestContext,
  shouldBehaveLikeLSP14WithLSP20,
} from './LSP20CallVerification/LSP20WithLSP14.behaviour';

describe('UniversalProfile with constructor', () => {
  const buildLSP3TestContext = async (initialFunding?: number): Promise<LSP3TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
      initialFunding,
    };

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );

    const universalProfile = await UniversalProfile__factory.deploy(deployParams.owner.address, {
      value: initialFunding,
    });

    await universalProfile.waitForDeployment();

    return { accounts, universalProfile, deployParams };
  };

  const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
    const accounts = await ethers.getSigners();

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );

    const lsp1Implementation = await UniversalProfile__factory.deploy(accounts[0].address);

    const UniversalReceiverTester__factory = await ethers.getContractFactory(
      'UniversalReceiverTester',
      accounts[0],
    );

    const lsp1Checker = await UniversalReceiverTester__factory.deploy();

    return { accounts, lsp1Implementation, lsp1Checker };
  };

  const buildLSP14WithLSP20TestContext = async (
    initialFunding?: number | bigint,
  ): Promise<LSP14CombinedWithLSP20TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
      initialFunding,
    };

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );

    const contract = await UniversalProfile__factory.deploy(deployParams.owner.address, {
      value: initialFunding,
    });

    const onlyOwnerCustomError = 'OwnableCallerNotTheOwner';

    return { accounts, contract, deployParams, onlyOwnerCustomError };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );

    const contract = await UniversalProfile__factory.deploy(deployParams.owner.address);

    return { accounts, contract, deployParams };
  };

  const buildLSP20TestContext = async (): Promise<LSP20TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );

    const universalProfile = await UniversalProfile__factory.deploy(deployParams.owner.address);

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
          const balance = await provider.getBalance(await context.universalProfile.getAddress());
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
