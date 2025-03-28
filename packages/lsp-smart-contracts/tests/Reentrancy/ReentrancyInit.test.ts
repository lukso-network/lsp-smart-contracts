import { ethers } from 'hardhat';

import { UniversalProfileInit__factory, LSP6KeyManagerInit__factory } from '../../typechain';

import { deployProxy } from '../utils/fixtures';
import { LSP6TestContext } from '../utils/context';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test';

describe('Reentrancy scenarios with proxy', () => {
  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(mainController).deploy();
    const upProxy = await deployProxy(await baseUP.getAddress(), mainController);
    const universalProfile = (await baseUP.attach(upProxy)) as UniversalProfileInit;

    const baseKM = await new LSP6KeyManagerInit__factory(mainController).deploy();
    const kmProxy = await deployProxy(await baseKM.getAddress(), mainController);
    const keyManager = (await baseKM.attach(kmProxy)) as unknown as LSP6KeyManagerInit;

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  const initializeProxies = async (context: LSP6TestContext) => {
    await context.universalProfile['initialize(address)'](context.mainController.address, {
      value: context.initialFunding,
    });

    await context.keyManager['initialize(address)'](await context.universalProfile.getAddress());

    return context;
  };

  describe('when testing Reentrancy scenarios for LSP6', () => {
    shouldBehaveLikeLSP6ReentrancyScenarios(async (initialFunding?: bigint) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxies(context);
      return context;
    });
  });

  describe('when testing Reentrancy scenarios for LSP20 + LSP6', () => {
    shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios(async (initialFunding?: bigint) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxies(context);
      return context;
    });
  });
});
