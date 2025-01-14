import { ethers } from 'hardhat';

import { UniversalProfile__factory, LSP6KeyManager__factory } from '../../../typechain';

import { LSP6TestContext } from '../../utils/context';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour';

describe('LSP20 + LSP6 with constructor', () => {
  const buildTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
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
