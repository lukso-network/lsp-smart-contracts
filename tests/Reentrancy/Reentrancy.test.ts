import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { UniversalProfile__factory, LSP6KeyManager__factory } from '../../types';

import { LSP6TestContext } from '../utils/context';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test';

describe('Reentrancy scenarios with constructor', () => {
  const buildTestContext = async (initialFunding?: BigNumber): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const universalProfile = await new UniversalProfile__factory(mainController).deploy(
      mainController.address,
      {
        value: initialFunding,
      },
    );

    const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
      universalProfile.address,
    );

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  describe('when testing Reentrancy scenarios for LSP6', () => {
    shouldBehaveLikeLSP6ReentrancyScenarios(buildTestContext);
  });

  describe('when testing Reentrancy scenarios for LSP20 + LSP6', () => {
    shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios(buildTestContext);
  });
});
