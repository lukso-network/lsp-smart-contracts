import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { UniversalProfile__factory, LSP6KeyManager__factory } from '../../../types';

import { LSP6TestContext } from '../../utils/context';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour';

describe('LSP20 + LSP6 with constructor', () => {
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

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });
});
