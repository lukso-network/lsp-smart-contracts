import { expect } from 'chai';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8Enumerable,
  LSP8EnumerableTestContext,
  getNamedAccounts,
} from '../LSP8Enumerable.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';
import { ethers } from 'hardhat';

describe('LSP8EnumerableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 Enumerable - deployed with proxy',
      symbol: 'LSP8 NMRBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const LSP8EnumerableInitTester__factory = await ethers.getContractFactory(
      'LSP8EnumerableInitTester',
      accounts.owner,
    );

    const LSP8EnumerableInit = await LSP8EnumerableInitTester__factory.deploy();

    const lsp8EnumerableProxy = await deployProxy(
      await LSP8EnumerableInit.getAddress(),
      accounts.owner,
    );
    const lsp8Enumerable = LSP8EnumerableInit.attach(lsp8EnumerableProxy);

    return { accounts, lsp8Enumerable, deployParams };
  };

  const initializeProxy = async (context: LSP8EnumerableTestContext) => {
    return context.lsp8Enumerable['initialize(string,string,address,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.lsp8TokenIdFormat,
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
