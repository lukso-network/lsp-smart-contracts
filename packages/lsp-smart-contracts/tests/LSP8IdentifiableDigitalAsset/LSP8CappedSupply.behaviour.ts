import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { LSP8CappedSupplyTester } from '../../typechain';

import type { BytesLike } from 'ethers';

export type LSP8CappedSupplyTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8CappedSupplyTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8CappedSupplyTestContext = {
  accounts: LSP8CappedSupplyTestAccounts;
  lsp8CappedSupply: LSP8CappedSupplyTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    lsp4TokenType: number;
    lsp8TokenIdFormat: number;
    tokenSupplyCap: bigint;
  };
};

export const shouldBehaveLikeLSP8CappedSupply = (
  buildContext: () => Promise<LSP8CappedSupplyTestContext>,
) => {
  let context: LSP8CappedSupplyTestContext;
  let mintedTokenIds: Array<BytesLike>;

  beforeEach(async () => {
    context = await buildContext();

    mintedTokenIds = Array(ethers.toNumber(context.deployParams.tokenSupplyCap))
      .fill(null)
      .map((_, i) => ethers.keccak256(ethers.toBeHex(BigInt(i))));
  });

  describe('tokenSupplyCap', () => {
    it('should allow reading tokenSupplyCap', async () => {
      const tokenSupplyCap = await context.lsp8CappedSupply.tokenSupplyCap();
      expect(tokenSupplyCap).to.equal(context.deployParams.tokenSupplyCap);
    });
  });

  describe('when minting tokens', () => {
    it('should allow minting amount up to tokenSupplyCap', async () => {
      const preTokenSupplyCap = await context.lsp8CappedSupply.tokenSupplyCap();
      const preTotalSupply = await context.lsp8CappedSupply.totalSupply();
      expect(preTokenSupplyCap - preTotalSupply).to.equal(String(mintedTokenIds.length));

      for (let i = 0; i < mintedTokenIds.length; i++) {
        const preMintTotalSupply = await context.lsp8CappedSupply.totalSupply();

        const tokenId = mintedTokenIds[i];
        await context.lsp8CappedSupply.mint(context.accounts.tokenReceiver.address, tokenId);

        const postMintTotalSupply = await context.lsp8CappedSupply.totalSupply();
        expect(postMintTotalSupply).to.equal(preMintTotalSupply + BigInt(1));
      }

      const postTokenSupplyCap = await context.lsp8CappedSupply.tokenSupplyCap();
      const postTotalSupply = await context.lsp8CappedSupply.totalSupply();
      expect(postTotalSupply - postTokenSupplyCap).to.equal(ethers.ZeroAddress);
    });

    describe('when cap has been reached', () => {
      const anotherTokenId = ethers.keccak256(ethers.toUtf8Bytes('VIP token'));

      it('should error when minting more than tokenSupplyCapTokens', async () => {
        await Promise.all(
          mintedTokenIds.map((tokenId) =>
            context.lsp8CappedSupply.mint(context.accounts.tokenReceiver.address, tokenId),
          ),
        );

        const tokenSupplyCap = await context.lsp8CappedSupply.tokenSupplyCap();
        const preTotalSupply = await context.lsp8CappedSupply.totalSupply();
        expect(preTotalSupply - tokenSupplyCap).to.equal(ethers.ZeroAddress);

        await expect(
          context.lsp8CappedSupply.mint(context.accounts.tokenReceiver.address, anotherTokenId),
        ).to.be.revertedWithCustomError(
          context.lsp8CappedSupply,
          'LSP8CappedSupplyCannotMintOverCap',
        );
      });

      it('should allow minting after burning', async () => {
        await Promise.all(
          mintedTokenIds.map((tokenId) =>
            context.lsp8CappedSupply.mint(context.accounts.tokenReceiver.address, tokenId),
          ),
        );

        const tokenSupplyCap = await context.lsp8CappedSupply.tokenSupplyCap();
        const preBurnTotalSupply = await context.lsp8CappedSupply.totalSupply();
        expect(preBurnTotalSupply - tokenSupplyCap).to.equal(ethers.ZeroAddress);

        await context.lsp8CappedSupply.burn(mintedTokenIds[0]);

        const postBurnTotalSupply = await context.lsp8CappedSupply.totalSupply();
        expect(postBurnTotalSupply).to.equal(preBurnTotalSupply - BigInt(1));

        await context.lsp8CappedSupply.mint(context.accounts.tokenReceiver.address, anotherTokenId);

        const postMintTotalSupply = await context.lsp8CappedSupply.totalSupply();
        expect(postMintTotalSupply - preBurnTotalSupply).to.equal(ethers.ZeroAddress);
      });
    });
  });
};
