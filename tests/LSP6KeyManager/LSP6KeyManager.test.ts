import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  KeyManagerInternalTester__factory,
} from '../../types';

import { LSP6TestContext } from '../utils/context';

import {
  shouldInitializeLikeLSP6,
  shouldBehaveLikeLSP6,
  testLSP6InternalFunctions,
} from './LSP6KeyManager.behaviour';

describe('LSP6KeyManager with constructor', () => {
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

  describe('when deploying the contract', () => {
    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP6(buildTestContext);
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });

  describe('testing internal functions', () => {
    testLSP6InternalFunctions(async () => {
      const accounts = await ethers.getSigners();
      const mainController = accounts[0];

      const universalProfile = await new UniversalProfile__factory(mainController).deploy(
        mainController.address,
      );
      const keyManagerInternalTester = await new KeyManagerInternalTester__factory(
        mainController,
      ).deploy(universalProfile.address);

      return { mainController, accounts, universalProfile, keyManagerInternalTester };
    });
  });
});
