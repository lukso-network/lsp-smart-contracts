import { expect } from 'chai';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { hexlify, randomBytes, toBeHex, zeroPadValue } from 'ethers';

import { LSP8EnumerableTester } from '../../types/ethers-contracts/index.js';

export type LSP8EnumerableTestAccounts = {
  owner: HardhatEthersSigner;
  tokenReceiver: HardhatEthersSigner;
};

export const getNamedAccounts = async (
  ethers: HardhatEthers,
): Promise<LSP8EnumerableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8EnumerableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  lsp4TokenType: number;
  lsp8TokenIdFormat: number;
};

export type LSP8EnumerableTestContext = {
  ethers: HardhatEthers;
  accounts: LSP8EnumerableTestAccounts;
  lsp8Enumerable: LSP8EnumerableTester;
  deployParams: LSP8EnumerableDeployParams;
};

export const shouldBehaveLikeLSP8Enumerable = (
  buildContext: () => Promise<LSP8EnumerableTestContext>,
) => {
  let context: LSP8EnumerableTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('when no minted tokens', () => {
    it('should not get token', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(
        zeroPadValue(toBeHex(BigInt(0)), 32),
      );
    });
  });

  describe('when minted tokens', () => {
    const tokenId = randomBytes(32);

    it('should access by index', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply + BigInt(1));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(hexlify(tokenId));
    });

    it('should not access by index after removed', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      const anotherTokenId = randomBytes(32);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, anotherTokenId);
      await context.lsp8Enumerable.burn(tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply + BigInt(1));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(hexlify(anotherTokenId));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply + BigInt(1))).to.equal(
        zeroPadValue(toBeHex(BigInt(0)), 32),
      );
    });

    it('should access by index after removed', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      const anotherTokenId = randomBytes(32);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, anotherTokenId);
      await context.lsp8Enumerable.burn(tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply + BigInt(2));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(hexlify(anotherTokenId));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply + BigInt(1))).to.equal(
        hexlify(tokenId),
      );
    });
  });
};
