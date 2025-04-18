import { ethers } from 'hardhat';
import { expect } from 'chai';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP7CappedSupply,
  LSP7CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP7CappedSupply.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP7CappedSupplyInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 capped supply - deployed with proxy',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      tokenSupplyCap: ethers.toBigInt('2'),
    };

    const LSP7CappedSupplyInitTester__factory = await ethers.getContractFactory(
      'LSP7CappedSupplyInitTester',
      accounts.owner,
    );

    const lsp7CappedSupplyInit = await LSP7CappedSupplyInitTester__factory.deploy();
    const lsp7CappedSupplyProxy = await deployProxy(
      await lsp7CappedSupplyInit.getAddress(),
      accounts.owner,
    );
    const lsp7CappedSupply = lsp7CappedSupplyInit.attach(lsp7CappedSupplyProxy);

    return { accounts, lsp7CappedSupply, deployParams };
  };

  const initializeProxy = async (context: LSP7CappedSupplyTestContext) => {
    return context.lsp7CappedSupply['initialize(string,string,address,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.tokenSupplyCap,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP7CappedSupplyTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP7(async () => {
        const { lsp7CappedSupply: lsp7, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp7,
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
    shouldBehaveLikeLSP7CappedSupply(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
