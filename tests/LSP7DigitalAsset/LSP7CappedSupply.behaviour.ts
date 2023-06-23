import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP7CappedSupplyTester } from '../../types';

import type { BigNumber } from 'ethers';

export type LSP7CappedSupplyTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7CappedSupplyTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP7CappedSupplyTestContext = {
  accounts: LSP7CappedSupplyTestAccounts;
  lsp7CappedSupply: LSP7CappedSupplyTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    tokenSupplyCap: BigNumber;
  };
};

export const shouldBehaveLikeLSP7CappedSupply = (
  buildContext: () => Promise<LSP7CappedSupplyTestContext>,
) => {
  let context: LSP7CappedSupplyTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('tokenSupplyCap', () => {
    it('should allow reading tokenSupplyCap', async () => {
      const tokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
      expect(tokenSupplyCap).to.equal(context.deployParams.tokenSupplyCap);
    });
  });

  describe('when minting tokens', () => {
    it('should allow minting amount up to tokenSupplyCap', async () => {
      const preTokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
      const preTotalSupply = await context.lsp7CappedSupply.totalSupply();
      expect(preTokenSupplyCap.sub(preTotalSupply)).to.equal(context.deployParams.tokenSupplyCap);

      await context.lsp7CappedSupply.mint(
        context.accounts.tokenReceiver.address,
        context.deployParams.tokenSupplyCap,
      );

      const postTokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
      const postTotalSupply = await context.lsp7CappedSupply.totalSupply();
      expect(postTotalSupply.sub(postTokenSupplyCap)).to.equal(ethers.constants.Zero);
    });

    describe('when cap has been reached', () => {
      it('should error when minting more than tokenSupplyCapTokens', async () => {
        await context.lsp7CappedSupply.mint(
          context.accounts.tokenReceiver.address,
          context.deployParams.tokenSupplyCap,
        );

        const tokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
        const preTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(preTotalSupply.sub(tokenSupplyCap)).to.equal(ethers.constants.Zero);

        await expect(
          context.lsp7CappedSupply.mint(context.accounts.tokenReceiver.address, 1),
        ).to.be.revertedWithCustomError(
          context.lsp7CappedSupply,
          'LSP7CappedSupplyCannotMintOverCap',
        );
      });

      it('should allow minting after burning', async () => {
        await context.lsp7CappedSupply.mint(
          context.accounts.tokenReceiver.address,
          context.deployParams.tokenSupplyCap,
        );

        const tokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
        const preBurnTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(preBurnTotalSupply.sub(tokenSupplyCap)).to.equal(ethers.constants.Zero);

        await context.lsp7CappedSupply
          .connect(context.accounts.tokenReceiver)
          .burn(context.accounts.tokenReceiver.address, 1);

        const postBurnTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(postBurnTotalSupply).to.equal(preBurnTotalSupply.sub(1));

        await context.lsp7CappedSupply.mint(context.accounts.tokenReceiver.address, 1);

        const postMintTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(postMintTotalSupply.sub(preBurnTotalSupply)).to.equal(ethers.constants.Zero);
      });
    });
  });
};
