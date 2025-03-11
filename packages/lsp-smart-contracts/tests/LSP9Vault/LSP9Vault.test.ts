import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ContractFactory } from 'ethers';

// helpers + fixtures
import { provider } from '../utils/helpers';
import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures';

import {
  LSP14TestContext,
  shouldBehaveLikeLSP14,
} from '../LSP14Ownable2Step/LSP14Ownable2Step.behaviour';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP9,
  shouldInitializeLikeLSP9,
  LSP9TestContext,
} from './LSP9Vault.behaviour';

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from '../LSP17ContractExtension/LSP17Extendable.behaviour';

describe('LSP9Vault with constructor', () => {
  let LSP9Vault__factory;

  before(async () => {
    LSP9Vault__factory = await ethers.getContractFactory('LSP9Vault');
  });

  const buildTestContext = async (initialFunding?: number): Promise<LSP9TestContext> => {
    const accounts = await getNamedAccounts();

    const deployParams = {
      newOwner: accounts.owner.address,
      initialFunding,
    };
    const lsp9Vault = await LSP9Vault__factory.connect(accounts.owner).deploy(
      deployParams.newOwner,
      {
        value: initialFunding,
      },
    );

    const [UP1, KM1] = await setupProfileWithKeyManagerWithURD(accounts.owner);

    const universalProfile = UP1;
    const lsp6KeyManager = KM1;

    return {
      accounts,
      lsp9Vault,
      deployParams,
      universalProfile,
      lsp6KeyManager,
    };
  };

  const buildLSP14TestContext = async (
    initialFunding?: number | bigint,
  ): Promise<LSP14TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = { owner: accounts[0], initialFunding };

    const lsp9Vault = await LSP9Vault__factory.connect(accounts[0]).deploy(
      deployParams.owner.address,
      {
        value: initialFunding,
      },
    );

    const onlyOwnerCustomError = 'Only Owner or reentered Universal Receiver Delegate allowed';

    return {
      accounts,
      contract: lsp9Vault,
      deployParams,
      onlyOwnerCustomError,
    };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };
    const contract = await LSP9Vault__factory.connect(accounts[0]).deploy(
      deployParams.owner.address,
    );

    return { accounts, contract, deployParams };
  };

  [{ initialFunding: undefined }, { initialFunding: 0 }, { initialFunding: 5 }].forEach(
    (testCase) => {
      describe('when deploying the contract with or without value', () => {
        let context: LSP9TestContext;

        before(async () => {
          context = await buildTestContext(testCase.initialFunding);
        });

        it(`should have deployed with the correct funding amount (${testCase.initialFunding})`, async () => {
          const balance = await provider.getBalance(await context.lsp9Vault.getAddress());
          expect(balance).to.equal(testCase.initialFunding || 0);
        });
      });
    },
  );

  describe('when deploying the contract', () => {
    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP9(async () => {
        const context = await buildTestContext();
        const { lsp9Vault, deployParams } = context;

        return {
          lsp9Vault,
          deployParams,
          initializeTransaction: context.lsp9Vault.deploymentTransaction(),
        };
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP9(buildTestContext);
    shouldBehaveLikeLSP14(buildLSP14TestContext);
    shouldBehaveLikeLSP17(buildLSP17TestContext);
  });
});
