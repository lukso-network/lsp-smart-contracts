import { expect } from 'chai';

import { LSP8Tester__factory } from '../../../types/ethers-contracts/index.js';
import { type LSP8IdentifiableDigitalAsset } from '../../../../lsp8-contracts/types/ethers-contracts/index.js';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  shouldInitializeLikeLSP8,
  LSP8TestContext,
} from '../LSP8IdentifiableDigitalAsset.behaviour.js';

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from '../../LSP17ContractExtension/LSP17ExtendableTokens.behaviour.js';

import {
  LS4DigitalAssetMetadataTestContext,
  shouldBehaveLikeLSP4DigitalAssetMetadata,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8IdentifiableDigitalAsset with constructor', () => {
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
    const lsp8 = await new LSP8Tester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
    );

    return { ethers, accounts, lsp8, deployParams };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { ethers, lsp8 } = await buildTestContext(LSP8_TOKEN_ID_FORMAT.NUMBER);
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
        lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      };

      return { ethers, contract: lsp8 as LSP8IdentifiableDigitalAsset, accounts, deployParams };
    };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();

    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      owner: accounts[0],
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };
    const contract = await new LSP8Tester__factory(accounts[0]).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.owner.address,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
    );

    return { ethers, accounts, contract, deployParams: { owner: deployParams.owner.address } };
  };

  describe('when deploying the contract', () => {
    it('should revert when deploying with address(0) as owner', async () => {
      const { network } = await import('hardhat');
      const { ethers } = await network.connect();
      const accounts = await ethers.getSigners();

      const deployParams = {
        name: 'LSP8 - deployed with constructor',
        symbol: 'NFT',
        newOwner: ethers.ZeroAddress,
        lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      };

      const contractToDeploy = new LSP8Tester__factory(accounts[0]);

      await expect(
        contractToDeploy.deploy(
          deployParams.name,
          deployParams.symbol,
          ethers.ZeroAddress,
          deployParams.lsp4TokenType,
          LSP8_TOKEN_ID_FORMAT.NUMBER,
        ),
      ).to.be.revertedWithCustomError(contractToDeploy, 'OwnableCannotSetZeroAddressAsOwner');
    });

    describe('once the contract was deployed', () => {
      let context: LSP8TestContext;

      before(async () => {
        context = await buildTestContext(0);
      });

      shouldInitializeLikeLSP8(async () => {
        const { lsp8, deployParams } = context;

        return {
          lsp8,
          deployParams,
          initializeTransaction: context.lsp8.deploymentTransaction(),
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
