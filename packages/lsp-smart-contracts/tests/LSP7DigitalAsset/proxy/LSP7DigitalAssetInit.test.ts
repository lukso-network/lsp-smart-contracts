import { expect } from 'chai';
import { toBigInt, ZeroAddress } from 'ethers';

import {
  type LSP7InitTester,
  LSP7InitTester__factory,
} from '../../../types/ethers-contracts/index.js';
import { type LSP7DigitalAsset } from '../../../../lsp7-contracts/types/ethers-contracts/index.js';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP7,
  shouldInitializeLikeLSP7,
  type LSP7TestContext,
} from '../LSP7DigitalAsset.behaviour.js';

import {
  shouldBehaveLikeLSP4DigitalAssetMetadata,
  type LS4DigitalAssetMetadataTestContext,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour.js';

import { deployProxy } from '../../utils/fixtures.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

describe('LSP7DigitalAssetInit with proxy', () => {
  const buildTestContext = async (): Promise<LSP7TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);
    const initialSupply = toBigInt('3');
    const deployParams = {
      name: 'LSP7 - deployed with proxy',
      symbol: 'TKN',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
    };

    const lsp7TesterInit = await new LSP7InitTester__factory(accounts.owner).deploy();

    const lsp7Proxy = await deployProxy(await lsp7TesterInit.getAddress(), accounts.owner);

    const lsp7 = lsp7TesterInit.attach(lsp7Proxy) as LSP7InitTester;

    // mint tokens for the owner
    await lsp7.mint(accounts.owner.address, initialSupply, true, '0x');

    return { ethers, accounts, lsp7, deployParams, initialSupply };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { ethers, lsp7 } = await buildTestContext();
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
        lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      };

      return { ethers, contract: lsp7 as LSP7DigitalAsset, accounts, deployParams };
    };

  const initializeProxy = async (context: LSP7TestContext) => {
    return context.lsp7['initialize(string,string,address,uint256,bool)'](
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.lsp4TokenType,
      false,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP7TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    it('should revert when initializing with address(0) as owner', async () => {
      await expect(
        context.lsp7['initialize(string,string,address,uint256,bool)'](
          context.deployParams.name,
          context.deployParams.symbol,
          ZeroAddress,
          12345,
          false,
        ),
      ).to.be.revertedWithCustomError(context.lsp7, 'OwnableCannotSetZeroAddressAsOwner');
    });

    describe('when initializing the contract', () => {
      shouldInitializeLikeLSP7(async () => {
        const { lsp7, deployParams } = context;
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
    shouldBehaveLikeLSP4DigitalAssetMetadata(async () => {
      const lsp4Context = await buildLSP4DigitalAssetMetadataTestContext();

      await lsp4Context.contract['initialize(string,string,address,uint256,bool)'](
        'LSP7 - deployed with proxy',
        'TKN',
        lsp4Context.deployParams.owner.address,
        lsp4Context.deployParams.lsp4TokenType,
        false,
      );

      return lsp4Context;
    });

    shouldBehaveLikeLSP7(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
