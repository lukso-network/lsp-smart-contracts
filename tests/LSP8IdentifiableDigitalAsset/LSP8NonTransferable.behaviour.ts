import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP8NonTransferableTester } from '../../types';

import { ERC725YDataKeys } from '../../constants';

export type LSP8NonTransferableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8NonTransferableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8NonTransferableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP8NonTransferableTestContext = {
  accounts: LSP8NonTransferableTestAccounts;
  lsp8NonTransferable: LSP8NonTransferableTester;
  deployParams: LSP8NonTransferableDeployParams;
};

export const shouldBehaveLikeLSP8NonTransferable = (
  buildContext: () => Promise<LSP8NonTransferableTestContext>,
) => {
  let context: LSP8NonTransferableTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when setting data on ERC725Y storage', () => {
    it('should revert trying to edit lsp8NonTransferable key', async () => {
      const nonTransferable = ERC725YDataKeys.LSP8.LSP8NonTransferable;
      const value = '0x00';
      expect(
        context.lsp8NonTransferable
          .connect(context.deployParams.newOwner)
          .setData(nonTransferable, value),
      ).to.be.revertedWithCustomError(
        context.lsp8NonTransferable,
        'LSP8NonTransferableNotEditable',
      );
    });
  });

  describe('when transferring a token', () => {
    const tokensIds = [ethers.utils.randomBytes(32), ethers.utils.randomBytes(32)];

    before(async () => {
      for (const tokenId of tokensIds) {
        await context.lsp8NonTransferable
          .connect(context.accounts.owner)
          .mint(context.accounts.owner.address, tokenId, true, '0x');
      }
    });

    it('should revert if try to transfer a token', async () => {
      await expect(
        context.lsp8NonTransferable
          .connect(context.accounts.owner)
          .transfer(
            context.accounts.owner.address,
            context.accounts.tokenReceiver.address,
            tokensIds[0],
            true,
            '0x',
          ),
      ).to.be.revertedWith('LSP8: Token is non-transferable');
    });

    it('should revert if try to transfer batch of tokens', async () => {
      await expect(
        context.lsp8NonTransferable
          .connect(context.accounts.owner)
          .transferBatch(
            [context.accounts.owner.address, context.accounts.owner.address],
            [context.accounts.tokenReceiver.address, context.accounts.tokenReceiver.address],
            tokensIds,
            [true, true],
            ['0x', '0x'],
          ),
      ).to.be.revertedWith('LSP8: Token is non-transferable');
    });
  });
};
