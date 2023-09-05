import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP8Tester__factory, LSP8IdentifiableDigitalAsset } from '../../../types';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  shouldInitializeLikeLSP8,
  LSP8TestContext,
} from '../LSP8IdentifiableDigitalAsset.behaviour';

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from '../../LSP17ContractExtension/LSP17ExtendableTokens.behaviour';

import {
  LS4DigitalAssetMetadataTestContext,
  shouldBehaveLikeLSP4DigitalAssetMetadata,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour';

describe('LSP8IdentifiableDigitalAsset with constructor', () => {
  const buildTestContext = async (): Promise<LSP8TestContext> => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      newOwner: accounts.owner.address,
    };
    const lsp8 = await new LSP8Tester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
    );

    return { accounts, lsp8, deployParams };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { lsp8 } = await buildTestContext();
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
      };

      return {
        contract: lsp8 as LSP8IdentifiableDigitalAsset,
        accounts,
        deployParams,
      };
    };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const accounts = await ethers.getSigners();

    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      owner: accounts[0],
    };
    const contract = await new LSP8Tester__factory(accounts[0]).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.owner.address,
    );

    return { accounts, contract, deployParams };
  };

  describe('when deploying the contract', () => {
    it('should revert when deploying with address(0) as owner', async () => {
      const accounts = await ethers.getSigners();

      const deployParams = {
        name: 'LSP8 - deployed with constructor',
        symbol: 'NFT',
        newOwner: ethers.constants.AddressZero,
      };

      await expect(
        new LSP8Tester__factory(accounts[0]).deploy(
          deployParams.name,
          deployParams.symbol,
          ethers.constants.AddressZero,
        ),
      ).to.be.revertedWith('Ownable: new owner is the zero address');
    });

    describe('once the contract was deployed', () => {
      let context: LSP8TestContext;

      before(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP8(async () => {
        const { lsp8, deployParams } = context;

        return {
          lsp8,
          deployParams,
          initializeTransaction: context.lsp8.deployTransaction,
        };
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP4DigitalAssetMetadata(buildLSP4DigitalAssetMetadataTestContext);
    shouldBehaveLikeLSP8(buildTestContext);
    shouldBehaveLikeLSP17(buildLSP17TestContext);
  });
});
