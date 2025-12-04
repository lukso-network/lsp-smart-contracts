import {
  type LSP8Mintable,
  LSP8Mintable__factory,
} from '../../../../lsp8-contracts/types/ethers-contracts/index.js';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour.js';
import {
  type LSP8MintableTestContext,
  shouldBehaveLikeLSP8Mintable,
  getNamedAccounts,
} from '../LSP8Mintable.behaviour.js';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';

describe('LSP8Mintable with constructor', () => {
  const buildTestContext = async () => {
    const { network } = await import('hardhat');
    const { ethers } = await network.connect();
    const accounts = await getNamedAccounts(ethers);

    const deployParams = {
      name: 'LSP8 Mintable - deployed with constructor',
      symbol: 'LSP8 MNTBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdFormat: LSP8_TOKEN_ID_FORMAT.NUMBER,
    };

    const lsp8Mintable: LSP8Mintable = await new LSP8Mintable__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdFormat,
    );

    return { ethers, accounts, lsp8Mintable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8MintableTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8Mintable: lsp8, deployParams } = context;

      return {
        lsp8,
        deployParams,
        initializeTransaction: context.lsp8Mintable.deploymentTransaction(),
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8Mintable(buildTestContext);
  });
});
