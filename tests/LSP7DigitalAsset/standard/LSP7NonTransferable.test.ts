import { LSP7NonTransferableTester, LSP7NonTransferableTester__factory } from '../../../types';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';
import { ERC725YDataKeys } from '../../../constants';
import { expect } from 'chai';
import { ContractTransaction } from 'ethers';
import {
  getNamedAccounts,
  LSP7NonTransferableTestAccounts,
  shouldBehaveLikeLSP7NonTransferable,
} from '../LSP7NonTransferable.behaviour';

type LSP7NonTransferableTestContext = {
  accounts: LSP7NonTransferableTestAccounts;
  lsp7NonTransferable: LSP7NonTransferableTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
};

describe('lsp7NonTransferable with constructor', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 Non-Transferable - deployed with constructor',
      symbol: 'NTT',
      newOwner: accounts.owner.address,
      isNonDivisible: false,
    };

    const lsp7NonTransferable = await new LSP7NonTransferableTester__factory(accounts.owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.newOwner,
      deployParams.isNonDivisible,
    );

    return { accounts, lsp7NonTransferable, deployParams };
  };

  describe('when deploying the contract', () => {
    let context: LSP7NonTransferableTestContext;
    let initializeTransaction: ContractTransaction;

    before(async () => {
      context = await buildTestContext();
    });

    shouldInitializeLikeLSP7(async () => {
      const { lsp7NonTransferable: lsp7, deployParams } = context;
      initializeTransaction = context.lsp7NonTransferable.deployTransaction;

      return {
        lsp7,
        deployParams,
        initializeTransaction,
      };
    });

    it('should flag the contract as Non-Transferable', async () => {
      const nonTransferable = ERC725YDataKeys.LSP7.LSP7NonTransferable;
      const expectedNonTransferableValue = '0x01';
      await expect(initializeTransaction)
        .to.emit(context.lsp7NonTransferable, 'DataChanged')
        .withArgs(nonTransferable, expectedNonTransferableValue);
      expect(await context.lsp7NonTransferable.getData(nonTransferable)).to.equal(
        expectedNonTransferableValue,
      );
    });
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP7NonTransferable(buildTestContext);
  });
});
