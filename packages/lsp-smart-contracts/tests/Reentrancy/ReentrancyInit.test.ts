import { ethers } from 'hardhat';

import { deployProxy } from '../utils/fixtures';
import { LSP6TestContext } from '../utils/context';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test';

describe('Reentrancy scenarios with proxy', () => {
  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const UniversalProfileInit__factory = await ethers.getContractFactory(
      'UniversalProfileInit',
      accounts[0],
    );
    const LSP6KeyManagerInit__factory = await ethers.getContractFactory(
      'LSP6KeyManagerInit',
      accounts[0],
    );

    const baseUP = await UniversalProfileInit__factory.deploy();
    const upProxy = await deployProxy(await baseUP.getAddress(), mainController);
    const universalProfile = baseUP.attach(upProxy);

    const baseKM = await LSP6KeyManagerInit__factory.deploy();
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
