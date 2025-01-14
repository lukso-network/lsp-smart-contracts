import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { LSP2UtilsLibraryTester, LSP2UtilsLibraryTester__factory } from '../typechain';
import { BytesLike } from 'ethers';

function encodeCompactBytesArray(inputKeys: BytesLike[]) {
  let compactBytesArray = '0x';
  for (let i = 0; i < inputKeys.length; i++) {
    compactBytesArray +=
      ethers
        .zeroPadValue(ethers.toBeHex(inputKeys[i].toString().substring(2).length / 2), 2)
        .substring(2) + inputKeys[i].toString().substring(2);
  }

  return compactBytesArray;
}

describe('LSP2Utils', () => {
  let accounts: SignerWithAddress[];
  let lsp2Utils: LSP2UtilsLibraryTester;

  before(async () => {
    accounts = await ethers.getSigners();
    lsp2Utils = await new LSP2UtilsLibraryTester__factory(accounts[0]).deploy();
  });

  describe('`isCompactBytesArray(...)`', () => {
    it('should return true with `0x` (equivalent to `[]`)', async () => {
      const data = '0x';
      const result = await lsp2Utils.isCompactBytesArray(data);
      expect(result).to.be.true;
    });

    describe('when pass a CompactBytesArray with one element', () => {
      it('should return true when the first length byte is 0', async () => {
        const data = encodeCompactBytesArray(['0x']);
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.true;
      });

      it('should return true when the first length byte matches the following number of bytes', async () => {
        const data = encodeCompactBytesArray(['0xaabbccddee']);
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.true;
      });

      it('should return false when the first length does not matches the following number of bytes', async () => {
        let data = encodeCompactBytesArray(['0xaabbccddee']);

        // replace the first length byte of 0xaabbccddee with an invalid length value
        data = String(data).replace(/05/g, '10');

        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.false;
      });
    });

    describe('when passing a CompactBytesArray with 3 x elements', () => {
      it('should return true when all the length bytes match the number of bytes of each elements', async () => {
        const data = encodeCompactBytesArray(['0xaabbccddee', '0xaabbccddee', '0xaabbccddee']);
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.true;
      });

      it('should return true even if one of the element is an empty byte', async () => {
        const data = encodeCompactBytesArray(['0xaabbccddee', '0x', '0x1122334455']);
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.true;
      });

      it('should return true if all the elements are empty bytes', async () => {
        const data = encodeCompactBytesArray(['0x', '0x', '0x']);
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.true;
      });

      it('should return false if one of the byte length of an element has an incorrect length', async () => {
        let data = encodeCompactBytesArray(['0xaabbccddee', '0xcafecafecafecafe', '0x112233']);

        // replace the first length byte of 0xaabbccddee with an invalid length value
        data = String(data).replace(/05/g, '10');
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.false;
      });

      it("should return false if the byte length of the last element is invalid and points 'too far'", async () => {
        const data = '0x02aabb05112233445520cafecafe';
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.false;
      });

      it('should return false for 0x000000', async () => {
        const data = '0x000000';
        const result = await lsp2Utils.isCompactBytesArray(data);
        expect(result).to.be.false;
      });
    });
  });
});
