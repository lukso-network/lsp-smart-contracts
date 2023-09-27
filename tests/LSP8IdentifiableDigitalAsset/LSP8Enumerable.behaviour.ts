import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LSP8EnumerableTester } from '../../types';

export type LSP8EnumerableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8EnumerableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8EnumerableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  tokenIdType: number;
};

export type LSP8EnumerableTestContext = {
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
        ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32),
      );
    });
  });

  describe('when minted tokens', () => {
    const tokenId = ethers.utils.randomBytes(32);

    it('should access by index', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply.add(1));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(
        ethers.utils.hexlify(tokenId),
      );
    });

    it('should not access by index after removed', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      const anotherTokenId = ethers.utils.randomBytes(32);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, anotherTokenId);
      await context.lsp8Enumerable.burn(tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply.add(1));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(
        ethers.utils.hexlify(anotherTokenId),
      );
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply.add(1))).to.equal(
        ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32),
      );
    });

    it('should access by index after removed', async () => {
      const tokenSupply = await context.lsp8Enumerable.totalSupply();
      const anotherTokenId = ethers.utils.randomBytes(32);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, anotherTokenId);
      await context.lsp8Enumerable.burn(tokenId);
      await context.lsp8Enumerable.mint(context.accounts.tokenReceiver.address, tokenId);
      expect(await context.lsp8Enumerable.totalSupply()).to.equal(tokenSupply.add(2));
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply)).to.equal(
        ethers.utils.hexlify(anotherTokenId),
      );
      expect(await context.lsp8Enumerable.tokenAt(tokenSupply.add(1))).to.equal(
        ethers.utils.hexlify(tokenId),
      );
    });
  });
};
