import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  LSP0ERC725Account,
  UniversalProfileInit__factory,
  UniversalReceiverTester__factory,
} from '../types';
import { deployProxy } from './utils/fixtures';

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
import { BigNumber } from 'ethers';
import {
  LSP14CombinedWithLSP20TestContext,
  shouldBehaveLikeLSP14WithLSP20,
} from './LSP20CallVerification/LSP20WithLSP14.behaviour';

describe('UniversalProfileInit with proxy', () => {
  let universalProfileInit;
  let accounts;

  before(async () => {
    accounts = await ethers.getSigners();
    universalProfileInit = await new UniversalProfileInit__factory(accounts[0]).deploy();
  });

  const buildLSP3TestContext = async (initialFunding?: number): Promise<LSP3TestContext> => {
    const deployParams = {
      owner: accounts[0],
      initialFunding,
    };

    const universalProfileProxy = await deployProxy(universalProfileInit.address, accounts[0]);

    const universalProfile = universalProfileInit.attach(universalProfileProxy);

    return { accounts, universalProfile, deployParams };
  };

  const initializeProxy = async (context: LSP3TestContext) => {
    return context.universalProfile['initialize(address)'](context.deployParams.owner.address, {
      value: context.deployParams.initialFunding,
    });
  };

  const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
    const universalProfileProxy = await deployProxy(universalProfileInit.address, accounts[0]);

    const lsp1Implementation = universalProfileInit.attach(universalProfileProxy);

    await lsp1Implementation.initialize(accounts[0].address);

    const lsp1Checker = await new UniversalReceiverTester__factory(accounts[0]).deploy();

    return { accounts, lsp1Implementation, lsp1Checker };
  };

  const buildLSP14WithLSP20TestContext = async (
    initialFunding?: number | BigNumber,
  ): Promise<LSP14CombinedWithLSP20TestContext> => {
    const deployParams = {
      owner: accounts[0],
      initialFunding: initialFunding,
    };

    const universalProfileProxy = await deployProxy(universalProfileInit.address, accounts[0]);

    const universalProfile = universalProfileInit.attach(universalProfileProxy);

    const onlyOwnerCustomError = 'OwnableCallerNotTheOwner';

    return {
      accounts,
      contract: universalProfile,
      deployParams,
      onlyOwnerCustomError,
    };
  };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const deployParams = {
      owner: accounts[0],
    };

    const universalProfileProxy = await deployProxy(universalProfileInit.address, accounts[0]);

    const universalProfile = universalProfileInit.attach(universalProfileProxy);

    return { accounts, contract: universalProfile, deployParams };
  };

  const buildLSP20TestContext = async (): Promise<LSP20TestContext> => {
    const accounts = await ethers.getSigners();
    const deployParams = {
      owner: accounts[0],
    };

    const universalProfileInit = await new UniversalProfileInit__factory(accounts[0]).deploy();

    const universalProfileProxy = await deployProxy(universalProfileInit.address, accounts[0]);

    const universalProfile = universalProfileInit.attach(universalProfileProxy);

    return { accounts, universalProfile: universalProfile, deployParams };
  };

  describe('when deploying the base implementation contract', () => {
    it('`owner()` of the base contract MUST be `address(0)`', async () => {
      const owner = await universalProfileInit.owner();
      expect(owner).to.equal(ethers.constants.AddressZero);
    });

    it('prevent any address from calling the initialize(...) function on the implementation', async () => {
      const randomCaller = accounts[1];

      await expect(universalProfileInit.initialize(randomCaller.address)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  [{ initialFunding: undefined }, { initialFunding: 0 }, { initialFunding: 5 }].forEach(
    (testCase) => {
      describe('when deploying + intializing the proxy contract with or without value', () => {
        it(`should have initialized with the correct funding amount (${testCase.initialFunding})`, async () => {
          const context = await buildLSP3TestContext(testCase.initialFunding);
          await initializeProxy(context);
          const balance = await provider.getBalance(context.universalProfile.address);
          expect(balance).to.equal(testCase.initialFunding || 0);
        });
      });
    },
  );

  describe('when calling `initialize(...)` more than once', () => {
    it('should revert', async () => {
      const context = await buildLSP3TestContext();
      await initializeProxy(context);

      await expect(initializeProxy(context)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('when deploying + initializing the proxy contract', () => {
    shouldInitializeLikeLSP3(async () => {
      const context = await buildLSP3TestContext();
      await initializeProxy(context);
      return context;
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP3(async (initialFunding?: number) => {
      const context = await buildLSP3TestContext(initialFunding);
      await initializeProxy(context);
      return context;
    });

    shouldBehaveLikeLSP1(async () => {
      const lsp3Context = await buildLSP3TestContext();
      await initializeProxy(lsp3Context);

      const lsp1Context = await buildLSP1TestContext();
      return lsp1Context;
    });

    shouldBehaveLikeLSP14WithLSP20(async (initialFunding?: number | BigNumber) => {
      const claimOwnershipContext = await buildLSP14WithLSP20TestContext(initialFunding);

      await initializeProxy({
        accounts: claimOwnershipContext.accounts,
        universalProfile: claimOwnershipContext.contract as LSP0ERC725Account,
        deployParams: claimOwnershipContext.deployParams,
      });

      return claimOwnershipContext;
    });

    shouldBehaveLikeLSP17(async () => {
      const fallbackExtensionContext = await buildLSP17TestContext();

      await initializeProxy({
        accounts: fallbackExtensionContext.accounts,
        universalProfile: fallbackExtensionContext.contract as LSP0ERC725Account,
        deployParams: fallbackExtensionContext.deployParams,
      });

      return fallbackExtensionContext;
    });

    shouldBehaveLikeLSP20(async () => {
      const reverseVerificationContext = await buildLSP20TestContext();

      await initializeProxy({
        accounts: reverseVerificationContext.accounts,
        universalProfile: reverseVerificationContext.universalProfile,
        deployParams: reverseVerificationContext.deployParams,
      });

      return reverseVerificationContext;
    });
  });
});
