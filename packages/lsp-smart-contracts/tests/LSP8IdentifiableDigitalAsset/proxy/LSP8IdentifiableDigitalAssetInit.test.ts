import { expect } from 'chai';
import { ZeroAddress } from 'ethers';

import { type LSP8Tester, LSP8InitTester__factory } from '../../../types/ethers-contracts/index.js';
import { type LSP8IdentifiableDigitalAsset } from '../../../../lsp8-contracts/types/ethers-contracts/index.js';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  shouldInitializeLikeLSP8,
  type LSP8TestContext,
} from '../LSP8IdentifiableDigitalAsset.behaviour.js';

import {
  shouldBehaveLikeLSP4DigitalAssetMetadata,
  type LS4DigitalAssetMetadataTestContext,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour.js';

import { deployProxy } from '../../utils/fixtures.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP8IdentifiableDigitalAssetInit with proxy', () => {
  const buildTestContext = async (nftType: number): Promise<LSP8TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);
    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: nftType,
    };

    const lsp8TesterInit = await new LSP8InitTester__factory(accounts.owner).deploy();
    const lsp8Proxy = await deployProxy(await lsp8TesterInit.getAddress(), accounts.owner);
    const lsp8 = lsp8TesterInit.attach(lsp8Proxy) as LSP8Tester;

    return { ethers, accounts, lsp8, deployParams };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { ethers, lsp8 } = await buildTestContext(0);
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
        lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      };

      return {
        ethers,
        contract: lsp8 as LSP8IdentifiableDigitalAsset,
        accounts,
        deployParams,
      };
    };

  const initializeProxy = async (context: LSP8TestContext) => {
    return context.lsp8['initialize(string,string,address,uint256,uint256)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      context.deployParams.lsp8TokenIdFormat,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8TestContext;

    before(async () => {
      context = await buildTestContext(0);
    });

    it('should revert when initializing with address(0) as owner', async () => {
      await expect(
        context.lsp8['initialize(string,string,address,uint256,uint256)'](
          context.deployParams.name,
          context.deployParams.symbol,
          ZeroAddress,
          0,
          context.deployParams.lsp4TokenType,
        ),
      ).to.be.revertedWithCustomError(context.lsp8, 'OwnableCannotSetZeroAddressAsOwner');
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP8(async () => {
        const { lsp8, deployParams } = context;
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
    shouldBehaveLikeLSP4DigitalAssetMetadata(async () => {
      const lsp4Context = await buildLSP4DigitalAssetMetadataTestContext();

      await lsp4Context.contract['initialize(string,string,address,uint256,uint256)'](
        'LSP8 - deployed with proxy',
        'NFT',
        lsp4Context.deployParams.owner.address,
        0,
        lsp4Context.deployParams.lsp4TokenType,
      );

      return lsp4Context;
    });

    shouldBehaveLikeLSP8(() =>
      buildTestContext(0).then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
