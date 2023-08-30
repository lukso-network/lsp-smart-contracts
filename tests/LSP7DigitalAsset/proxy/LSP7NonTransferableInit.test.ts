import { expect } from 'chai';

import {
  LSP7NonTransferableInitTester,
  LSP7NonTransferableInitTester__factory,
} from '../../../types';

import { shouldInitializeLikeLSP7 } from '../LSP7DigitalAsset.behaviour';

import { deployProxy } from '../../utils/fixtures';
import { ERC725YDataKeys } from '../../../constants';
import { ContractTransaction } from 'ethers';
import {
  getNamedAccounts,
  LSP7NonTransferableTestAccounts,
  shouldBehaveLikeLSP7NonTransferable,
} from '../LSP7NonTransferable.behaviour';

type LSP7NonTransferableInitTestContext = {
  accounts: LSP7NonTransferableTestAccounts;
  lsp7NonTransferable: LSP7NonTransferableInitTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    isNonDivisible: boolean;
  };
};

describe('LSP7NonTransferableInit with proxy', () => {
  const buildTestContext = async () => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: 'LSP7 Non-Transferable - deployed with constructor',
      symbol: 'BRN',
      newOwner: accounts.owner.address,
      isNonDivisible: false,
    };

    const lsp7NonTransferableImplementation = await new LSP7NonTransferableInitTester__factory(
      accounts.owner,
    ).deploy();
    const lsp7NonTransferableProxy = await deployProxy(
      lsp7NonTransferableImplementation.address,
      accounts.owner,
    );
    const lsp7NonTransferable = lsp7NonTransferableImplementation.attach(lsp7NonTransferableProxy);

    return { accounts, lsp7NonTransferable, deployParams };
  };

  const initializeProxy = async (context: LSP7NonTransferableInitTestContext) => {
    return context.lsp7NonTransferable.initialize(
      context.deployParams.name,
      context.deployParams.symbol,
      context.deployParams.newOwner,
      context.deployParams.isNonDivisible,
    );
  };

  describe('when deploying the contract as proxy', () => {
    let context: LSP7NonTransferableInitTestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('when initializing the contract', () => {
      let initializeTransaction: ContractTransaction;

      shouldInitializeLikeLSP7(async () => {
        const { lsp7NonTransferable: lsp7, deployParams } = context;
        initializeTransaction = await initializeProxy(context);

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

    describe('when calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });

    describe('when testing deployed contract', () => {
      shouldBehaveLikeLSP7NonTransferable(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);
          return context;
        }),
      );
    });
  });
});
