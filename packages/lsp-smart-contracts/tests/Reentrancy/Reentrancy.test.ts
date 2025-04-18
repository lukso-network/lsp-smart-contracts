import { ethers } from 'hardhat';

import { LSP6TestContext } from '../utils/context';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test';

describe('Reentrancy scenarios with constructor', () => {
  const buildTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      accounts[0],
    );
    const LSP6KeyManager__factory = await ethers.getContractFactory('LSP6KeyManager', accounts[0]);

    const universalProfile = await UniversalProfile__factory.deploy(mainController.address, {
      value: initialFunding,
    });

    const keyManager = await LSP6KeyManager__factory.deploy(await universalProfile.getAddress());

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  describe('when testing Reentrancy scenarios for LSP6', () => {
    shouldBehaveLikeLSP6ReentrancyScenarios(buildTestContext);
  });

  describe('when testing Reentrancy scenarios for LSP20 + LSP6', () => {
    shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios(buildTestContext);
  });
});
