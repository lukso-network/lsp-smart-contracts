import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8Enumerable,
  LSP8EnumerableTestContext,
  getNamedAccounts,
} from '../LSP8Enumerable.behaviour';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';
import { ethers } from 'hardhat';

describe('LSP8Enumerable with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();

    const deployParams = {
      name: 'LSP8 Enumerable - deployed with constructor',
      symbol: 'LSP8 NMRBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const LSP8EnumerableTester__factory = await ethers.getContractFactory(
      'LSP8EnumerableTester',
      accounts.owner,
    );

    const lsp8Enumerable = await LSP8EnumerableTester__factory.deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
    );

    return { accounts, lsp8Enumerable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8EnumerableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8Enumerable: lsp8, deployParams } = context;
      return {
        lsp8,
        deployParams,
        initializeTransaction: context.lsp8Enumerable.deploymentTransaction(),
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8Enumerable(buildTestContext);
  });
});
