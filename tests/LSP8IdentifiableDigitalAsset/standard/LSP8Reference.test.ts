import { LSP8_TOKEN_ID_TYPES } from '../../../constants';
import {
  LSP8ReferenceContractCollectionTester,
  LSP8ReferenceContractCollectionTester__factory,
  LSP8ReferenceTokenIdContractTester,
  LSP8ReferenceTokenIdContractTester__factory,
} from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';

import {
  shouldBehaveLikeLSP8Reference,
  LSP8ReferenceTestContext,
  getNamedAccounts,
} from '../LSP8Reference.behaviour';

describe('LSP8Reference with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();

    const deployParams = {
      name: 'LSP8 Reference Collection - deployed with constructor',
      symbol: 'LSP8 RFRC',
      newOwner: accounts.owner.address,
      tokenIdType: LSP8_TOKEN_ID_TYPES.ADDRESS,
    };

    const lsp8Collection: LSP8ReferenceContractCollectionTester =
      await new LSP8ReferenceContractCollectionTester__factory(accounts.owner).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner,
        deployParams.tokenIdType,
      );

    const lsp8TokenId: LSP8ReferenceTokenIdContractTester =
      await new LSP8ReferenceTokenIdContractTester__factory(accounts.owner).deploy(
        'LSP8 TokenId Address - deployed with constructor',
        'LSP8 RFRCTIA',
        deployParams.newOwner,
        deployParams.tokenIdType,
      );

    return { accounts, lsp8Collection, lsp8TokenId, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8ReferenceTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8Collection: lsp8, lsp8TokenId, deployParams } = context;

      return {
        lsp8,
        lsp8TokenId,
        deployParams,
        initializeTransaction: context.lsp8Collection.deployTransaction,
      };
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8Reference(buildTestContext);
  });
});
