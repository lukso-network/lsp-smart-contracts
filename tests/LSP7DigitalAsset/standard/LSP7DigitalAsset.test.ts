import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP7Tester__factory, LSP7DigitalAsset } from '../../../types';

import {
  getNamedAccounts,
  shouldBehaveLikeLSP7,
  shouldInitializeLikeLSP7,
  LSP7TestContext,
} from '../LSP7DigitalAsset.behaviour';

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from '../../LSP17ContractExtension/LSP17ExtendableTokens.behaviour';

import {
  LS4DigitalAssetMetadataTestContext,
  shouldBehaveLikeLSP4DigitalAssetMetadata,
} from '../../LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.behaviour';

describe('LSP7DigitalAsset with constructor', () => {
  const buildTestContext = async (): Promise<LSP7TestContext> => {
    const accounts = await getNamedAccounts();
    const initialSupply = ethers.BigNumber.from('3');
    const deployParams = {
      name: 'LSP7 - deployed with constructor',
      symbol: 'Token',
      newOwner: accounts.owner.address,
    };

    const lsp7 = await new LSP7Tester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
    );

    // mint tokens for the owner
    await lsp7.mint(accounts.owner.address, initialSupply, true, '0x');

    return { accounts, lsp7, deployParams, initialSupply };
  };

  const buildLSP4DigitalAssetMetadataTestContext =
    async (): Promise<LS4DigitalAssetMetadataTestContext> => {
      const { lsp7 } = await buildTestContext();
      const accounts = await ethers.getSigners();

      const deployParams = {
        owner: accounts[0],
      };

      return {
        contract: lsp7 as LSP7DigitalAsset,
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

    const contract = await new LSP7Tester__factory(accounts[0]).deploy(
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
        name: 'LSP7 - deployed with constructor',
        symbol: 'Token',
        newOwner: ethers.constants.AddressZero,
      };

      const contractToDeploy = new LSP7Tester__factory(accounts[0]);

      await expect(
        contractToDeploy.deploy(deployParams.name, deployParams.symbol, deployParams.newOwner),
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
          initializeTransaction: context.lsp7.deployTransaction,
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
