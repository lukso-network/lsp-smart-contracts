import {
  type UniversalProfileInit,
  UniversalProfileInit__factory,
} from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import {
  type LSP6KeyManagerInit,
  LSP6KeyManagerInit__factory,
} from '../../../lsp6-contracts/types/ethers-contracts/index.js';

import { deployProxy } from '../utils/fixtures.js';
import { type LSP6TestContext } from '../utils/context.js';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test.js';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test.js';

describe('Reentrancy scenarios with proxy', () => {
  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const { network } = await import('hardhat');
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(mainController).deploy();
    const upProxy = await deployProxy(await baseUP.getAddress(), mainController);
    const universalProfile = baseUP.attach(upProxy) as UniversalProfileInit;

    const baseKM = await new LSP6KeyManagerInit__factory(mainController).deploy();
    const kmProxy = await deployProxy(await baseKM.getAddress(), mainController);
    const keyManager = baseKM.attach(kmProxy) as unknown as LSP6KeyManagerInit;

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
