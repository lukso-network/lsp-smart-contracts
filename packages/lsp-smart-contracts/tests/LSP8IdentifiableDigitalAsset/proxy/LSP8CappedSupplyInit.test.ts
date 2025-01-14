import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  LSP8CappedSupplyInitTester,
  LSP8CappedSupplyInitTester__factory,
} from '../../../typechain';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8CappedSupply,
  LSP8CappedSupplyTestContext,
  getNamedAccounts,
} from '../LSP8CappedSupply.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8CappedSupplyInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 capped supply - deployed with proxy',
      symbol: 'CAP',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
      tokenSupplyCap: ethers.toBigInt('2'),
    };
    const lsp8CappedSupplyInit = await new LSP8CappedSupplyInitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp8CappedSupplyProxy = await deployProxy(
      await lsp8CappedSupplyInit.getAddress(),
      accounts.owner,
    );
    const lsp8CappedSupply = lsp8CappedSupplyInit.attach(
      lsp8CappedSupplyProxy,
    ) as LSP8CappedSupplyInitTester;

    return { accounts, lsp8CappedSupply, deployParams };
  };

  const initializeProxy = async (context: LSP8CappedSupplyTestContext) => {
    return context.lsp8CappedSupply['initialize(string,string,address,uint256,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.lsp8TokenIdFormat,
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
