import {
  type LSP8EnumerableTester,
  LSP8EnumerableTester__factory,
} from '../../../types/ethers-contracts/index.js';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour.js';
import {
  getNamedAccounts,
  shouldBehaveLikeLSP8Enumerable,
  type LSP8EnumerableTestContext,
} from '../LSP8Enumerable.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8Enumerable with constructor', () => {
  const buildTestContext = async () => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);

    const deployParams = {
      name: 'LSP8 Enumerable - deployed with constructor',
      symbol: 'LSP8 NMRBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const lsp8Enumerable: LSP8EnumerableTester = await new LSP8EnumerableTester__factory(
      accounts.owner,
    ).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
    );

    return { ethers, accounts, lsp8Enumerable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8EnumerableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { ethers, lsp8Enumerable: lsp8, deployParams } = context;
      return {
        ethers,
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
