import { expect } from 'chai';

import { LSP7Tester__factory } from '../../../types/ethers-contracts/index.js';
import { type LSP7DigitalAsset } from '../../../../lsp7-contracts/types/ethers-contracts/index.js';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP7,
  shouldInitializeLikeLSP7,
  type LSP7TestContext,
} from '../LSP7DigitalAsset.behaviour.js';

import {
  shouldBehaveLikeLSP17,
  type LSP17TestContext,
} from '../../LSP17ContractExtension/LSP17ExtendableTokens.behaviour.js';

import {
  shouldBehaveLikeLSP4DigitalAssetMetadata,
  type LS4DigitalAssetMetadataTestContext,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { toBigInt, ZeroAddress } from 'ethers';

describe('LSP7DigitalAsset with constructor', () => {
  const buildTestContext = async (): Promise<LSP7TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);
    const initialSupply = toBigInt('3');
    const deployParams = {
      name: 'LSP7 - deployed with constructor',
      symbol: 'Token',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
    };

    const lsp7 = await new LSP7Tester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
    );

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

      return {
        ethers,
        contract: lsp7 as LSP7DigitalAsset,
        accounts,
        deployParams,
      };
    };

  const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await ethers.getSigners();

    const deployParams = {
      name: 'LSP8 - deployed with constructor',
      symbol: 'NFT',
      owner: accounts[0],
      lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
    };

    const contract = await new LSP7Tester__factory(deployParams.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.owner.address,
      deployParams.lsp4TokenType,
    );

    return { ethers, accounts, contract, deployParams: { owner: deployParams.owner.address } };
  };

  describe('when deploying the contract', () => {
    it('should revert when deploying with address(0) as owner', async () => {
      const { network } = await import('hardhat');
      const { ethers } = await network.connect();
      const accounts = await ethers.getSigners();

      const deployParams = {
        name: 'LSP7 - deployed with constructor',
        symbol: 'Token',
        newOwner: ZeroAddress,
        lsp4TokenType: LSP4_TOKEN_TYPES.TOKEN,
      };

      const contractToDeploy = new LSP7Tester__factory(accounts[0]);

      await expect(
        contractToDeploy.deploy(
          deployParams.name,
          deployParams.symbol,
          deployParams.newOwner,
          deployParams.lsp4TokenType,
        ),
      ).to.be.revertedWithCustomError(contractToDeploy, 'OwnableCannotSetZeroAddressAsOwner');
    });

    describe('once the contract was deployed', () => {
      let context: LSP7TestContext;

      before(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP7(async () => {
        const { lsp7, deployParams } = context;
        return {
          lsp7,
          deployParams,
          initializeTransaction: context.lsp7.deploymentTransaction(),
        };
      });
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP4DigitalAssetMetadata(buildLSP4DigitalAssetMetadataTestContext);
    shouldBehaveLikeLSP7(buildTestContext);
    shouldBehaveLikeLSP17(buildLSP17TestContext);
  });
});
