import { expect } from 'chai';

import {
  LSP8NonTransferableInitTester,
  LSP8NonTransferableInitTester__factory,
} from '../../../types';

import { shouldInitializeLikeLSP8 } from '../LSP8IdentifiableDigitalAsset.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { ERC725YDataKeys } from '../../../constants';
import { ContractTransaction } from 'ethers';
import {
  getNamedAccounts,
  LSP8NonTransferableTestAccounts,
  shouldBehaveLikeLSP8NonTransferable,
} from '../LSP8NonTransferable.behaviour';

type LSP8NonTransferableInitTestContext = {
  accounts: LSP8NonTransferableTestAccounts;
  lsp8NonTransferable: LSP8NonTransferableInitTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
};

describe('LSP8NonTransferableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP8 Non-Transferable - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts.owner.address,
    };

    const lsp8NonTransferableImplementation = await new LSP8NonTransferableInitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp8NonTransferableProxy = await deployProxy(
      lsp8NonTransferableImplementation.address,
      accounts.owner,
    );
    const lsp8NonTransferable = lsp8NonTransferableImplementation.attach(lsp8NonTransferableProxy);

    return { accounts, lsp8NonTransferable, deployParams };
  };

  const initializeProxy = async (context: LSP8NonTransferableInitTestContext) => {
    return context.lsp8NonTransferable.initialize(
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP8NonTransferableInitTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      let initializeTransaction: ContractTransaction;

      shouldInitializeLikeLSP8(async () => {
        const { lsp8NonTransferable: lsp8, deployParams } = context;
        initializeTransaction = await initializeProxy(context);

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

    describe('when calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeLSP8NonTransferable(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);
          return context;
        }),
      );
    });
  });
});
