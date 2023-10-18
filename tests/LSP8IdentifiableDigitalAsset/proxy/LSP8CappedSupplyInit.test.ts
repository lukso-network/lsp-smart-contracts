import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP8CappedSupplyInitTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8CappedSupply,
  LSP8CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP8CappedSupply.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

describe('LSP8CappedSupplyInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 capped supply - deployed with proxy',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
      tokenSupplyCap: ethers.BigNumber.from('2'),
    };
    const lsp8CappedSupplyInit = await new LSP8CappedSupplyInitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp8CappedSupplyProxy = await deployProxy(lsp8CappedSupplyInit.address, accounts.owner);
    const lsp8CappedSupply = lsp8CappedSupplyInit.attach(lsp8CappedSupplyProxy);

    return { accounts, lsp8CappedSupply, deployParams };
  };

  const initializeProxy = async (context: LSP8CappedSupplyTestContext) => {
    return context.lsp8CappedSupply['initialize(string,string,address,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.tokenIdType,
      context.deployParams.tokenSupplyCap,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8CappedSupplyTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8CappedSupply: lsp8, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp8,
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
    shouldBehaveLikeLSP8CappedSupply(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
