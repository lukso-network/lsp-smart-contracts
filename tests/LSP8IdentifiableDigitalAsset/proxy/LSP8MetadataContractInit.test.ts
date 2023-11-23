import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP8MetadataContract, LSP8MetadataContractInitTester__factory } from '../../../types';

import {
  shouldInitializeLikeLSP8MetadataContract,
  shouldBehaveLikeLSP8MetadataContract,
  LSP8MetadataContractTestContext,
} from '../LSP8MetadataContract.behaviour';
import { deployProxy } from '../../utils/fixtures';

describe('LSP8MetadataContractInit with proxy', () => {
  const buildContext = async (): Promise<LSP8MetadataContractTestContext> => {
    const accounts = await ethers.getSigners();

    const deployParams = {
      contractOwner: accounts[0],
      referenceContract: ethers.Wallet.createRandom().address,
    };

    const lsp8MetadataContractInit = await new LSP8MetadataContractInitTester__factory(
      accounts[0],
    ).deploy();
    const lsp8Proxy = await deployProxy(lsp8MetadataContractInit.address, accounts[0]);
    const lsp8 = lsp8MetadataContractInit.attach(lsp8Proxy);

    return {
      lsp8MetadataContract: lsp8 as LSP8MetadataContract,
      deployParams,
    };
  };

  const initializeProxy = async (context: LSP8MetadataContractTestContext) => {
    return context.lsp8MetadataContract['initialize(address,address)'](
      context.deployParams.contractOwner.address,
      context.deployParams.referenceContract,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8MetadataContractTestContext;

    before(async () => {
      context = await buildContext();
    });

    it('should revert when initializing with address(0) as owner', async () => {
      await expect(
        context.lsp8MetadataContract['initialize(address,address)'](
          ethers.constants.AddressZero,
          '0xcafecafecafecafecafecafecafecafecafecafe', // reference contract
        ),
      ).to.be.revertedWithCustomError(
        context.lsp8MetadataContract,
        'OwnableCannotSetZeroAddressAsOwner',
      );
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8MetadataContract(async () => {
        const { lsp8MetadataContract, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp8MetadataContract,
          deployParams,
          initializeTransaction,
        };
      });
    });

    describe('when calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8MetadataContract(async () => {
      const context = await buildContext();
      await initializeProxy(context);

      return context;
    });
  });
});
