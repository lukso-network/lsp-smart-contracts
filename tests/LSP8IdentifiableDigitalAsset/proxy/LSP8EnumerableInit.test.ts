import { expect } from 'chai';
import { LSP8EnumerableInitTester, LSP8EnumerableInitTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8Enumerable,
  LSP8EnumerableTestContext,
  getNamedAccounts,
} from '../LSP8Enumerable.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP8_TOKEN_ID_TYPES } from '../../../constants';

describe('LSP8EnumerableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 Enumerable - deployed with proxy',
      symbol: 'LSP8 NMRBL',
      newOwner: accounts.owner.address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.NUMBER,
    };

    const LSP8EnumerableInit: LSP8EnumerableInitTester =
      await new LSP8EnumerableInitTester__factory(accounts.owner).deploy();

    const lsp8EnumerableProxy = await deployProxy(LSP8EnumerableInit.address, accounts.owner);
    const lsp8Enumerable: LSP8EnumerableInitTester = LSP8EnumerableInit.attach(lsp8EnumerableProxy);

    return { accounts, lsp8Enumerable, deployParams };
  };

  const initializeProxy = async (context: LSP8EnumerableTestContext) => {
    return context.lsp8Enumerable['initialize(string,string,address,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.tokenIdType,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8EnumerableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8Enumerable: lsp8, deployParams } = context;
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
    shouldBehaveLikeLSP8Enumerable(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);
        return context;
      }),
    );
  });
});
