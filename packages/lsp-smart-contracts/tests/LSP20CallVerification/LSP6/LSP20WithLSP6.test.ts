import { ethers } from 'hardhat';

import { LSP6TestContext } from '../../utils/context';
import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour';

describe('LSP20 + LSP6 with constructor', () => {
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

    const keyManager = await LSP6KeyManager__factory.deploy(universalProfile.target);

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });
});
