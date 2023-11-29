import { LSP4_TOKEN_TYPES, LSP8_TOKEN_ID_SCHEMA } from '../../../constants';
import { LSP8Mintable, LSP8Mintable__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import {
  shouldBehaveLikeLSP8Mintable,
  LSP8MintableTestContext,
  getNamedAccounts,
} from '../LSP8Mintable.behaviour';

describe('LSP8Mintable with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();

    const deployParams = {
      name: 'LSP8 Mintable - deployed with constructor',
      symbol: 'LSP8 MNTBL',
      newOwner: accounts.owner.address,
      lsp4TokenType: LSP4_TOKEN_TYPES.NFT,
      lsp8TokenIdSchema: LSP8_TOKEN_ID_SCHEMA.NUMBER,
    };

    const lsp8Mintable: LSP8Mintable = await new LSP8Mintable__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.lsp4TokenType,
      deployParams.lsp8TokenIdSchema,
    );

    return { accounts, lsp8Mintable, deployParams };
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
        initializeTransaction: context.lsp8Mintable.deployTransaction,
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8Mintable(buildTestContext);
  });
});
