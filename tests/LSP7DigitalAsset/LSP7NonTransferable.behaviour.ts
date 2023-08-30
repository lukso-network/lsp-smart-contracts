import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP7NonTransferableTester } from '../../types';

import { ERC725YDataKeys } from '../../constants';

export type LSP7NonTransferableTestAccounts = {
  owner: SignerWithAddress;
  firstRecipient: SignerWithAddress;
  secondRecipient: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7NonTransferableTestAccounts> => {
  const [owner, firstRecipient, secondRecipient] = await ethers.getSigners();
  return { owner, firstRecipient, secondRecipient };
};

export type LSP7NonTransferableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7NonTransferableTestContext = {
  accounts: LSP7NonTransferableTestAccounts;
  lsp7NonTransferable: LSP7NonTransferableTester;
  deployParams: LSP7NonTransferableDeployParams;
};

export const shouldBehaveLikeLSP7NonTransferable = (
  buildContext: () => Promise<LSP7NonTransferableTestContext>,
) => {
  let context: LSP7NonTransferableTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when setting data on ERC725Y storage', () => {
    it('should revert trying to edit lsp7NonTransferable key', async () => {
      const nonTransferable = ERC725YDataKeys.LSP7.LSP7NonTransferable;
      const value = '0x00';
      expect(
        context.lsp7NonTransferable
          .connect(context.deployParams.newOwner)
          .setData(nonTransferable, value),
      ).to.be.revertedWithCustomError(
        context.lsp7NonTransferable,
        'LSP7NonTransferableNotEditable',
      );
    });
  });

  describe('when transferring a token', () => {
    before(async () => {
      await context.lsp7NonTransferable
        .connect(context.accounts.owner)
        .mint(context.accounts.owner.address, 10, true, '0x');
    });

    it('should revert if try to transfer a token', async () => {
      await expect(
        context.lsp7NonTransferable
          .connect(context.accounts.owner)
          .transfer(
            context.accounts.owner.address,
            context.accounts.firstRecipient.address,
            4,
            true,
            '0x',
          ),
      ).to.be.revertedWith('LSP7: Token is non-transferable');
    });

    it('should revert if try to transfer batch of tokens', async () => {
      await expect(
        context.lsp7NonTransferable
          .connect(context.accounts.owner)
          .transferBatch(
            [context.accounts.owner.address, context.accounts.owner.address],
            [context.accounts.firstRecipient.address, context.accounts.secondRecipient.address],
            [2, 5],
            [true, true],
            ['0x', '0x'],
          ),
      ).to.be.revertedWith('LSP7: Token is non-transferable');
    });
  });
};
