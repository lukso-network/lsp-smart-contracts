import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { UniversalProfileInit__factory, LSP6KeyManagerInit__factory } from '../../../types';

import { LSP6TestContext } from '../../utils/context';
import { deployProxy } from '../../utils/fixtures';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour';

describe('LSP20 Init + LSP6 Init with proxy', () => {
  const buildProxyTestContext = async (initialFunding?: BigNumber): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(mainController).deploy();
    const upProxy = await deployProxy(baseUP.address, mainController);
    const universalProfile = await baseUP.attach(upProxy);

    const baseKM = await new LSP6KeyManagerInit__factory(mainController).deploy();
    const kmProxy = await deployProxy(baseKM.address, mainController);
    const keyManager = await baseKM.attach(kmProxy);

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  const initializeProxy = async (context: LSP6TestContext) => {
    await context.universalProfile['initialize(address)'](context.mainController.address, {
      value: context.initialFunding,
    });

    await context.keyManager['initialize(address)'](context.universalProfile.address);

    return context;
  };

  describe('when deploying the base contract implementation', () => {
    it('should prevent any address from calling the `initialize(...)` function on the base contract', async () => {
      const context = await buildProxyTestContext();

      const baseKM = await new LSP6KeyManagerInit__factory(context.accounts[0]).deploy();

      await expect(baseKM.initialize(context.accounts[0].address)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('when deploying the contract as proxy', () => {
    let context: LSP6TestContext;

    describe('when calling `initialize(...) more than once`', () => {
      it('should revert', async () => {
        context = await buildProxyTestContext();
        await initializeProxy(context);

        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP6(async (initialFunding?: BigNumber) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxy(context);
      return context;
    });
  });
});
