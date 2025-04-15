import { expect } from 'chai';
import { ethers } from 'hardhat';

import { LSP6TestContext } from '../../utils/context';
import { deployProxy } from '../../utils/fixtures';

import { shouldBehaveLikeLSP6 } from './LSP20WithLSP6.behaviour';

describe('LSP20 Init + LSP6 Init with proxy', () => {
  before(async () => {});

  const buildProxyTestContext = async (initialFunding?: bigint): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();

    const UniversalProfileInit__factory = await ethers.getContractFactory(
      'UniversalProfileInit',
      accounts[0],
    );
    const LSP6KeyManagerInit__factory = await ethers.getContractFactory(
      'LSP6KeyManagerInit',
      accounts[0],
    );

    const mainController = accounts[0];

    const baseUP = await UniversalProfileInit__factory.deploy();
    const upProxy = await deployProxy(await baseUP.getAddress(), mainController);
    const universalProfile = baseUP.attach(upProxy);

    const baseKM = await LSP6KeyManagerInit__factory.deploy();
    const kmProxy = await deployProxy(await baseKM.getAddress(), mainController);
    const keyManager = baseKM.attach(kmProxy) as unknown;

    return { accounts, mainController, universalProfile, keyManager, initialFunding };
  };

  const initializeProxy = async (context: LSP6TestContext) => {
    await context.universalProfile['initialize(address)'](context.mainController.address, {
      value: context.initialFunding,
    });

    await context.keyManager['initialize(address)'](await context.universalProfile.getAddress());

    return context;
  };

  describe('when deploying the base contract implementation', () => {
    it('should prevent any address from calling the `initialize(...)` function on the base contract', async () => {
      const context = await buildProxyTestContext();

      const LSP6KeyManagerInit__factory = await ethers.getContractFactory(
        'LSP6KeyManagerInit',
        context.accounts[0],
      );

      const baseKM = await LSP6KeyManagerInit__factory.deploy();

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
    shouldBehaveLikeLSP6(async (initialFunding?: bigint) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxy(context);
      return context;
    });
  });
});
