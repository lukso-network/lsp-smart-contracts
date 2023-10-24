import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { LSP6TestContext } from '../utils/context';
import { LSP6KeyManagerInit__factory, UniversalProfileInit__factory } from '../../types';
import { deployProxy } from '../utils/fixtures';
import { shouldBehaveLikeLSP6, shouldInitializeLikeLSP6 } from './LSP6KeyManager.behaviour';

describe('LSP6KeyManager with proxy', () => {
  let context: LSP6TestContext;

  const buildProxyTestContext = async (initialFunding?: BigNumber): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(mainController).deploy();
    const upProxy = await deployProxy(baseUP.address, mainController);
    const universalProfile = await baseUP.attach(upProxy);

    const baseKM = await new LSP6KeyManagerInit__factory(mainController).deploy();
    const kmProxy = await deployProxy(baseKM.address, mainController);
    const keyManager = await baseKM.attach(kmProxy);

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  const initializeProxies = async (context: LSP6TestContext) => {
    await context.universalProfile['initialize(address)'](context.mainController.address, {
      value: context.initialFunding,
    });

    await context.keyManager['initialize(address)'](context.universalProfile.address);

    return context;
  };

  describe('when deploying the base LSP6KeyManagerInit implementation', () => {
    it('`target()` of the base Key Manager contract MUST be `address(0)`', async () => {
      const accounts = await ethers.getSigners();
      const keyManagerBaseContract = await new LSP6KeyManagerInit__factory(accounts[0]).deploy();

      const linkedTarget = await keyManagerBaseContract.target();
      expect(linkedTarget).to.equal(ethers.constants.AddressZero);
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
    shouldBehaveLikeLSP6(async (initialFunding?: BigNumber) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxies(context);
      return context;
    });
  });
});
