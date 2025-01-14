import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP7CappedSupplyTester } from '../../typechain';

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
    tokenSupplyCap: bigint;
    lsp4TokenType: number;
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
      expect(preTokenSupplyCap - preTotalSupply).to.equal(context.deployParams.tokenSupplyCap);

      await context.lsp7CappedSupply.mint(
        context.accounts.tokenReceiver.address,
        context.deployParams.tokenSupplyCap,
      );

      const postTokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
      const postTotalSupply = await context.lsp7CappedSupply.totalSupply();
      expect(postTotalSupply - BigInt(postTokenSupplyCap)).to.equal(ethers.ZeroAddress);
    });

    describe('when cap has been reached', () => {
      it('should error when minting more than tokenSupplyCapTokens', async () => {
        await context.lsp7CappedSupply.mint(
          context.accounts.tokenReceiver.address,
          context.deployParams.tokenSupplyCap,
        );

        const tokenSupplyCap = await context.lsp7CappedSupply.tokenSupplyCap();
        const preTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(preTotalSupply - BigInt(tokenSupplyCap)).to.equal(ethers.ZeroAddress);

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
        expect(preBurnTotalSupply - BigInt(tokenSupplyCap)).to.equal(ethers.ZeroAddress);

        await context.lsp7CappedSupply
          .connect(context.accounts.tokenReceiver)
          .burn(context.accounts.tokenReceiver.address, 1);

        const postBurnTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(postBurnTotalSupply).to.equal(preBurnTotalSupply - BigInt(1));

        await context.lsp7CappedSupply.mint(context.accounts.tokenReceiver.address, 1);

        const postMintTotalSupply = await context.lsp7CappedSupply.totalSupply();
        expect(postMintTotalSupply - preBurnTotalSupply).to.equal(ethers.ZeroAddress);
      });
    });
  });
};
