import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  shouldInitializeLikeLSP8,
  LSP8TestContext,
} from '../LSP8IdentifiableDigitalAsset.behaviour';

import {
  LS4DigitalAssetMetadataTestContext,
  shouldBehaveLikeLSP4DigitalAssetMetadata,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP8IdentifiableDigitalAssetInit with proxy', () => {
  const buildTestContext = async (nftType: number): Promise<LSP8TestContext> => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: nftType,
    };

    const LSP8InitTester__factory = await ethers.getContractFactory(
      'LSP8InitTester',
      accounts.owner,
    );

    const lsp8TesterInit = await LSP8InitTester__factory.deploy();
    const lsp8Proxy = await deployProxy(await lsp8TesterInit.getAddress(), accounts.owner);
    const lsp8 = lsp8TesterInit.attach(lsp8Proxy);

    return { accounts, lsp8: lsp8 as any, deployParams };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { lsp8 } = await buildTestContext(0);
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
        lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      };

      return {
        contract: lsp8,
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
          ethers.ZeroAddress,
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
