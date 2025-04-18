import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ContractFactory } from 'ethers';

// fixtures
import { deployProxy, setupProfileWithKeyManagerWithURD } from '../utils/fixtures';
import { shouldBehaveLikeLSP14 } from '../LSP14Ownable2Step/LSP14Ownable2Step.behaviour';

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

describe('LSP9VaultInit with proxy', () => {
  let LSP9VaultInit__factory;

  before(async () => {
    LSP9VaultInit__factory = await ethers.getContractFactory('LSP9VaultInit');
  });

  const buildTestContext = async (initialFunding?: number | bigint): Promise<LSP9TestContext> => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      newOwner: accounts.owner.address,
      initialFunding,
    };

    const lsp9VaultInit = await LSP9VaultInit__factory.connect(accounts.owner).deploy();
    const lsp9VaultProxy = await deployProxy(await lsp9VaultInit.getAddress(), accounts.owner);
    const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy);

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

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };

    const lsp9VaultInit = await LSP9VaultInit__factory.connect(accounts[0]).deploy();

    const lsp9VaultProxy = await deployProxy(await lsp9VaultInit.getAddress(), accounts[0]);

    const lsp9Vault = lsp9VaultInit.attach(lsp9VaultProxy);

    return { accounts, contract: lsp9Vault, deployParams };
  };

  const initializeProxy = async (context: LSP9TestContext) => {
    return context.lsp9Vault['initialize(address)'](context.deployParams.newOwner, {
      value: context.deployParams.initialFunding,
    });
  };

  describe('when deploying the base implementation contract', () => {
    it('`owner()` of the base contract MUST be `address(0)`', async () => {
      const accounts = await ethers.getSigners();

      const lsp9VaultInit = await LSP9VaultInit__factory.connect(accounts[0]).deploy();

      const owner = await lsp9VaultInit.owner();

      expect(owner).to.equal(ethers.ZeroAddress);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const accounts = await ethers.getSigners();

      const lsp9VaultInit = await LSP9VaultInit__factory.connect(accounts[0]).deploy();

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
      const accounts = await ethers.getSigners();
      await initializeProxy(context);

      const onlyOwnerCustomError = 'Only Owner or reentered Universal Receiver Delegate allowed';

      return {
        accounts: accounts,
        contract: context.lsp9Vault,
        deployParams: { owner: context.accounts.owner },
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
