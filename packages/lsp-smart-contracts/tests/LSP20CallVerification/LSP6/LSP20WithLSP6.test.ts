import { UniversalProfile__factory } from '../../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP6KeyManager__factory } from '../../../../lsp6-contracts/types/ethers-contracts/index.js';

import type { LSP6TestContext } from '../../utils/context.js';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour.js';

describe('LSP20 + LSP6 with constructor', () => {
  const buildTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const universalProfile = await new UniversalProfile__factory(mainController).deploy(
      mainController.address,
      {
        value: initialFunding,
      },
    );

    const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
      universalProfile.target,
    );

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });
});
