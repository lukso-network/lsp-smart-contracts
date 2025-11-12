import { network } from 'hardhat';
import { expect } from 'chai';

import { type LSP14TestContext, shouldBehaveLikeLSP14 } from '../LSP14Ownable2Step/LSP14Ownable2Step.behaviour.js';

import { type UniversalProfile } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { type LSP6KeyManager } from '../../../lsp6-contracts/types/ethers-contracts/index.js';
import {
  type LSP9VaultInit,
  LSP9VaultInit__factory,
} from '../../../lsp9-contracts/types/ethers-contracts/index.js';

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

import { deployProxy, setupProfileWithKeyManagerWithURD } from '../utils/fixtures.js';

describe('LSP9VaultInit with proxy', () => {
  const buildTestContext = async (initialFunding?: number | bigint): Promise<LSP9TestContext> => {
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);
    const deployParams = {
      newOwner: accounts.owner.address,
      initialFunding,
    };

    const lsp9VaultInit = await new LSP9VaultInit__factory(accounts.owner).deploy();
    const lsp9VaultProxy = await deployProxy(await lsp9VaultInit.getAddress(), accounts.owner);
    const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy) as LSP9VaultInit;

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
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = { owner: accounts[0], initialFunding };

    const lsp9VaultInit = await new LSP9VaultInit__factory(accounts[0]).deploy();
    const lsp9VaultProxy = await deployProxy(await lsp9VaultInit.getAddress(), accounts[0]);
    const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy) as LSP9VaultInit;

    const onlyOwnerCustomError = 'Only Owner or reentered Universal Receiver Delegate allowed';

    return {
      ethers,
      networkHelpers,
      accounts,
      contract: lsp9Vault,
      deployParams,
      onlyOwnerCustomError
    };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };

    const lsp9VaultInit = await new LSP9VaultInit__factory(accounts[0]).deploy();
    const lsp9VaultProxy = await deployProxy(await lsp9VaultInit.getAddress(), accounts[0]);
    const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy) as LSP9VaultInit;

    return { ethers, accounts, contract: lsp9Vault, deployParams };
  };

  const initializeProxy = async (context: LSP9TestContext) => {
    return (context.lsp9Vault as LSP9VaultInit).initialize(context.deployParams.newOwner, {
      value: context.deployParams.initialFunding,
    });
  };

  describe('when deploying the base implementation contract', () => {
    it('`owner()` of the base contract MUST be `address(0)`', async () => {
      const { ethers } = await network.connect();
      const accounts = await ethers.getSigners();

      const lsp9VaultInit = await new LSP9VaultInit__factory(accounts[0]).deploy();

      const owner = await lsp9VaultInit.owner();

      expect(owner).to.equal(ethers.ZeroAddress);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const { ethers } = await network.connect();
      const accounts = await ethers.getSigners();

      const lsp9VaultInit = await new LSP9VaultInit__factory(accounts[0]).deploy();

      const randomCaller = accounts[1];

      await expect(lsp9VaultInit.initialize(randomCaller.address)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('when deploying the contract as proxy', () => {
    let context: LSP9TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP9(async () => {
        const { lsp9Vault, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp9Vault,
          deployParams,
          initializeTransaction,
        };
      });
    });

    describe('when calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP9(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );

    shouldBehaveLikeLSP14(async (initialFunding?: number | bigint) => {
      const context = await buildTestContext(initialFunding);
      const accounts = await context.ethers.getSigners();
      await initializeProxy(context);

      const onlyOwnerCustomError = 'Only Owner or reentered Universal Receiver Delegate allowed';

      return {
        contract: context.lsp9Vault,
        deployParams: { owner: accounts[0] },
        ethers: context.ethers,
        networkHelpers: context.networkHelpers,
        accounts: accounts,
        onlyOwnerCustomError,
      };
    });

    shouldBehaveLikeLSP17(async () => {
      const fallbackExtensionContext = await buildLSP17TestContext();

      await fallbackExtensionContext.contract['initialize(address)'](
        fallbackExtensionContext.deployParams.owner.address,
      );

      return fallbackExtensionContext;
    });
  });
});
