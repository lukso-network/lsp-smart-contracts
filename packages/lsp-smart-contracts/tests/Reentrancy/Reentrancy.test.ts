import { UniversalProfile__factory } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP6KeyManager__factory } from '../../../lsp6-contracts/types/ethers-contracts/index.js';

import { type LSP6TestContext } from '../utils/context.js';

import { shouldBehaveLikeLSP6ReentrancyScenarios } from './LSP6/LSP6Reentrancy.test.js';
import { shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios } from './LSP20/LSP20WithLSP6Reentrancy.test.js';

describe('Reentrancy scenarios with constructor', () => {
  const buildTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const { network } = await import('hardhat');
    const { ethers, networkHelpers } = await network.connect();
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const universalProfile = await new UniversalProfile__factory(mainController).deploy(
      mainController.address,
      {
        value: initialFunding,
      },
    );

    const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
      await universalProfile.getAddress(),
    );

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

  describe('when testing Reentrancy scenarios for LSP6', () => {
    shouldBehaveLikeLSP6ReentrancyScenarios(buildTestContext);
  });

  describe('when testing Reentrancy scenarios for LSP20 + LSP6', () => {
    shouldBehaveLikeLSP20WithLSP6ReentrancyScenarios(buildTestContext);
  });
});
