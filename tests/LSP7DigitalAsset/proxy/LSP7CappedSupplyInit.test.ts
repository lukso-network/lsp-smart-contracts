import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP7CappedSupplyInitTester__factory } from '../../../types';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP7CappedSupply,
  LSP7CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP7CappedSupply.behaviour';

import { deployProxy } from '../../utils/fixtures';

describe('LSP7CappedSupplyInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 capped supply - deployed with proxy',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      tokenSupplyCap: ethers.BigNumber.from('2'),
    };
    const lsp7CappedSupplyInit = await new LSP7CappedSupplyInitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp7CappedSupplyProxy = await deployProxy(lsp7CappedSupplyInit.address, accounts.owner);
    const lsp7CappedSupply = lsp7CappedSupplyInit.attach(lsp7CappedSupplyProxy);

    return { accounts, lsp7CappedSupply, deployParams };
  };

  const initializeProxy = async (context: LSP7CappedSupplyTestContext) => {
    return context.lsp7CappedSupply['initialize(string,string,address,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
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
