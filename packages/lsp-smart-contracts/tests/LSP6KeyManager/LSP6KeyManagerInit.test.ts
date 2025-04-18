import { expect } from 'chai';
import { ethers } from 'hardhat';
import { LSP6TestContext } from '../utils/context';
import { deployProxy } from '../utils/fixtures';
import { shouldBehaveLikeLSP6, shouldInitializeLikeLSP6 } from './LSP6KeyManager.behaviour';

describe('LSP6KeyManager with proxy', () => {
  let context: LSP6TestContext;

  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const UniversalProfileInit = await ethers.getContractFactory(
      'UniversalProfileInit',
      mainController,
    );
    const baseUP = await UniversalProfileInit.deploy();
    const upProxy = await deployProxy(baseUP.target as string, mainController);
    const universalProfile = baseUP.attach(upProxy);

    const LSP6KeyManagerInit = await ethers.getContractFactory(
      'LSP6KeyManagerInit',
      mainController,
    );
    const baseKM = await LSP6KeyManagerInit.deploy();
    const kmProxy = await deployProxy(await baseKM.getAddress(), mainController);
    const keyManager = baseKM.attach(kmProxy);

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
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
      const accounts = await ethers.getSigners();
      const keyManagerBaseContract = await (
        await ethers.getContractFactory('LSP6KeyManagerInit', accounts[0])
      ).deploy();

      const linkedTarget = await keyManagerBaseContract['target()'].staticCall();
      expect(linkedTarget).to.equal(ethers.ZeroAddress);
    });

    it('should prevent any address from calling the `initialize(...)` function on the base contract', async () => {
      const context = await buildProxyTestContext();

      const baseKM = await (
        await ethers.getContractFactory('LSP6KeyManagerInit', context.accounts[0])
      ).deploy();

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
