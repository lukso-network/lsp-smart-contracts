import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  LSP8ReferenceContractCollectionTester,
  LSP8ReferenceTokenIdContractTester,
} from '../../types';

export type LPS8ReferenceTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LPS8ReferenceTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8ReferenceDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  tokenIdType: number;
};

export type LSP8ReferenceTestContext = {
  accounts: LPS8ReferenceTestAccounts;
  lsp8Collection: LSP8ReferenceContractCollectionTester;
  lsp8TokenId: LSP8ReferenceTokenIdContractTester;
  deployParams: LSP8ReferenceDeployParams;
};

export const shouldBehaveLikeLSP8Reference = (
  buildContext: () => Promise<LSP8ReferenceTestContext>,
) => {
  let context: LSP8ReferenceTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('when minting a tokenId - Address', () => {
    it('Should mint a tokenId as lsp8tokenId Contract address using the modifier', async () => {
      await context.lsp8TokenId.setReferenceCollectionContract(context.lsp8Collection.address);
      const tokenId = context.lsp8TokenId.address + '00'.repeat(12);
      const tx = context.lsp8Collection.mintAndCheckFromModifier(
        context.accounts.tokenReceiver.address,
        tokenId,
      );
      await expect(tx).to.be.not.revertedWithCustomError(
        context.lsp8Collection,
        'InvalidReferenceAddress',
      );
    });
    it('Should mint a tokenId as lsp8tokenId Contract address using the internal validator', async () => {
      await context.lsp8TokenId.setReferenceCollectionContract(context.lsp8Collection.address);
      const tokenId = context.lsp8TokenId.address + '00'.repeat(12);
      const tx = context.lsp8Collection.mintAndCheckInternally(
        context.accounts.tokenReceiver.address,
        tokenId,
      );
      await expect(tx).to.be.not.revertedWith('Invalid reference address');
    });
    it('Should not mint a tokenId as lsp8tokenId Contract address with another reference address', async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      await context.lsp8TokenId.setReferenceCollectionContract(randomAddress);
      const tokenId = context.lsp8TokenId.address + '00'.repeat(12);
      await expect(
        context.lsp8Collection.mintAndCheckFromModifier(
          context.accounts.tokenReceiver.address,
          tokenId,
        ),
      )
        .to.be.revertedWithCustomError(context.lsp8Collection, 'InvalidReferenceAddress')
        .withArgs(context.lsp8TokenId.address);
    });
  });
};
