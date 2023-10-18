import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  LSP6KeyManagerSingleton__factory,
} from '../../../types';

import { LSP6SingletonTestContext } from '../../utils/context';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6Singleton.behaviour';

describe('LSP20 + LSP6 with constructor', () => {
  const buildTestContext = async (
    initialFunding?: BigNumber,
  ): Promise<LSP6SingletonTestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const universalProfile = await new UniversalProfile__factory(mainController).deploy(
      mainController.address,
      {
        value: initialFunding,
      },
    );

    const keyManager = await new LSP6KeyManagerSingleton__factory(mainController).deploy();

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });
});
