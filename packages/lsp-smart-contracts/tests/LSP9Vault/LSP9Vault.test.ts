import { network } from 'hardhat';
import { expect } from 'chai';

import {
  type LSP14TestContext,
  shouldBehaveLikeLSP14,
} from '../LSP14Ownable2Step/LSP14Ownable2Step.behaviour.js';

import { type LSP6KeyManager } from '../../../lsp6-contracts/types/ethers-contracts/index.js';
import { type UniversalProfile } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP9Vault__factory } from '../../../lsp9-contracts/types/ethers-contracts/index.js';

import {
  type LSP9TestContext,
  getNamedAccounts,
  shouldBehaveLikeLSP9,
  shouldInitializeLikeLSP9,
} from './LSP9Vault.behaviour.js';

import {
  type LSP17TestContext,
  shouldBehaveLikeLSP17,
} from '../LSP17ContractExtension/LSP17Extendable.behaviour.js';

import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures.js';

describe('LSP9Vault with constructor', () => {
  const buildTestContext = async (initialFunding?: number): Promise<LSP9TestContext> => {
    const { ethers, networkHelpers } = await network.connect()
    const accounts = await getNamedAccounts(ethers);

    const deployParams = {
      newOwner: accounts.owner.address,
      initialFunding,
    };
    const lsp9Vault = await new LSP9Vault__factory(accounts.owner).deploy(deployParams.newOwner, {
      value: initialFunding,
    });

    const [UP1, KM1] = await setupProfileWithKeyManagerWithURD(accounts.owner);

    const universalProfile = UP1 as UniversalProfile;
    const lsp6KeyManager = KM1 as LSP6KeyManager;

    return {
      ethers,
      networkHelpers,
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
    const { ethers, networkHelpers } = await network.connect()
    const accounts = await ethers.getSigners();
    const deployParams = { owner: accounts[0], initialFunding };

    const lsp9Vault = await new LSP9Vault__factory(accounts[0]).deploy(deployParams.owner.address, {
      value: initialFunding,
    });

    const onlyOwnerCustomError = 'Only Owner or reentered Universal Receiver Delegate allowed';

    return {
      ethers,
      networkHelpers,
      accounts,
      contract: lsp9Vault,
      deployParams,
      onlyOwnerCustomError,
    };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const { ethers } = await network.connect()
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };
    const contract = await new LSP9Vault__factory(accounts[0]).deploy(deployParams.owner.address);

    return { ethers, accounts, contract, deployParams };
  };

  [{ initialFunding: undefined }, { initialFunding: 0 }, { initialFunding: 5 }].forEach(
    (testCase) => {
      describe('when deploying the contract with or without value', () => {
        let context: LSP9TestContext;

        before(async () => {
          context = await buildTestContext(testCase.initialFunding);
        });

        it(`should have deployed with the correct funding amount (${testCase.initialFunding})`, async () => {
          const balance = await context.ethers.provider.getBalance(await context.lsp9Vault.getAddress());
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
