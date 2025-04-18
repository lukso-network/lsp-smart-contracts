import { ethers } from 'hardhat';
import { LSP6TestContext } from '../utils/context';
import {
  shouldInitializeLikeLSP6,
  shouldBehaveLikeLSP6,
  testLSP6InternalFunctions,
} from './LSP6KeyManager.behaviour';

describe('LSP6KeyManager with constructor', () => {
  const buildTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const UniversalProfile = await ethers.getContractFactory('UniversalProfile', mainController);
    const universalProfile = await UniversalProfile.deploy(mainController.address, {
      value: initialFunding,
    });

    const LSP6KeyManager = await ethers.getContractFactory('LSP6KeyManager', mainController);
    const keyManager = await LSP6KeyManager.deploy(await universalProfile.getAddress());

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

      const UniversalProfile = await ethers.getContractFactory('UniversalProfile', mainController);
      const universalProfile = await UniversalProfile.deploy(mainController.address);

      const KeyManagerInternalTester = await ethers.getContractFactory(
        'KeyManagerInternalTester',
        mainController,
      );
      const keyManagerInternalTester = await KeyManagerInternalTester.deploy(
        universalProfile.target,
      );

      return { mainController, accounts, universalProfile, keyManagerInternalTester };
    });
  });
});
