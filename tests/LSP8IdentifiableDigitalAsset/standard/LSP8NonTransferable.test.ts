import { LSP8NonTransferableTester, LSP8NonTransferableTester__factory } from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';
import { ERC725YDataKeys } from '../../../constants';
import { expect } from 'chai';
import { ContractTransaction } from 'ethers';
import {
  getNamedAccounts,
  LSP8NonTransferableTestAccounts,
  shouldBehaveLikeLSP8NonTransferable,
} from '../LSP8NonTransferable.behaviour';

type LSP8NonTransferableTestContext = {
  accounts: LSP8NonTransferableTestAccounts;
  lsp8NonTransferable: LSP8NonTransferableTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
};

describe('lsp8NonTransferable with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 Non-Transferable - deployed with constructor',
      symbol: 'NTT',
      newOwner: accounts.owner.address,
    };

    const lsp8NonTransferable = await new LSP8NonTransferableTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
    );

    return { accounts, lsp8NonTransferable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP8NonTransferableTestContext;
    let initializeTransaction: ContractTransaction;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP8(async () => {
      const { lsp8NonTransferable: lsp8, deployParams } = context;
      initializeTransaction = context.lsp8NonTransferable.deployTransaction;

      return {
        lsp8,
        deployParams,
        initializeTransaction,
      };
    });

    it('should flag the contract as Non-Transferable', async () => {
      const nonTransferable = ERC725YDataKeys.LSP8.LSP8NonTransferable;
      const expectedNonTransferableValue = '0x01';
      await expect(initializeTransaction)
        .to.emit(context.lsp8NonTransferable, 'DataChanged')
        .withArgs(nonTransferable, expectedNonTransferableValue);
      expect(await context.lsp8NonTransferable.getData(nonTransferable)).to.equal(
        expectedNonTransferableValue,
      );
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8NonTransferable(buildTestContext);
  });
});
