import { expect } from 'chai';
import { network } from 'hardhat';
import type { LSP6TestContext } from '../utils/context.js';

import {
  type UniversalProfile,
  UniversalProfileInit__factory,
} from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import {
  type LSP6KeyManager,
  LSP6KeyManagerInit__factory,
} from '../../../lsp6-contracts/types/ethers-contracts/index.js';
import { deployProxy } from '../utils/fixtures.js';
import { shouldBehaveLikeLSP6, shouldInitializeLikeLSP6 } from './LSP6KeyManager.behaviour.js';

describe('LSP6KeyManager with proxy', () => {
  let context: LSP6TestContext;

  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(mainController).deploy();
    const upProxy = await deployProxy(baseUP.target as string, mainController);
    const universalProfile = baseUP.attach(upProxy) as unknown as UniversalProfile;

    const baseKM = await new LSP6KeyManagerInit__factory(mainController).deploy();
    const kmProxy = await deployProxy(await baseKM.getAddress(), mainController);
    const keyManager = baseKM.attach(kmProxy) as unknown as LSP6KeyManager;

    return {
      ethers,
      networkHelpers,
      accounts,
      mainController,
      universalProfile,
      keyManager,
      initialFunding,
    };
  };

  const initializeProxies = async (context: LSP6TestContext) => {
    await context.universalProfile['initialize(address)'](context.mainController.address, {
      value: context.initialFunding,
    });

    await context.keyManager['initialize(address)'](await context.universalProfile.getAddress());

    return context;
  };

  describe('when deploying the base LSP6KeyManagerInit implementation', () => {
    it('`target()` of the base Key Manager contract MUST be `address(0)`', async () => {
      const { ethers } = await network.connect();
      const accounts = await ethers.getSigners();
      const keyManagerBaseContract = await new LSP6KeyManagerInit__factory(accounts[0]).deploy();

      const linkedTarget = await keyManagerBaseContract['target()'].staticCall();
      expect(linkedTarget).to.equal(ethers.ZeroAddress);
    });

    it('should prevent any address from calling the `initialize(...)` function on the base contract', async () => {
      const context = await buildProxyTestContext();

      const baseKM = await new LSP6KeyManagerInit__factory(context.accounts[0]).deploy();

      await expect(baseKM.initialize(context.accounts[0].address)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('when initializing the proxy', () => {
    shouldInitializeLikeLSP6(async () => {
      context = await buildProxyTestContext();
      await initializeProxies(context);
      return context;
    });
  });

  describe('when calling `initialize(...) more than once`', () => {
    it('should revert', async () => {
      context = await buildProxyTestContext();
      await initializeProxies(context);

      await expect(initializeProxies(context)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('when testing the deployed proxy', () => {
    shouldBehaveLikeLSP6(async (initialFunding?: bigint) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxies(context);
      return context;
    });
  });
});
