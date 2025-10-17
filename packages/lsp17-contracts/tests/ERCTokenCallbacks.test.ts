import { expect } from 'chai';
import { network } from 'hardhat';
import { INTERFACE_ID_LSP17Extension } from '../constants.js';
import type { ERCTokenCallbacks } from '../types/ethers-contracts/index.js';
import { ERCTokenCallbacks__factory } from '../types/ethers-contracts/index.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';

describe('testing `ERCTokenCallbacks`', () => {
  let context: {
    tokenCallbacks: ERCTokenCallbacks;
    owner: HardhatEthersSigner;
  };

  before(async () => {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();
    const tokenCallbacks = await new ERCTokenCallbacks__factory(owner).deploy();

    context = {
      tokenCallbacks,
      owner,
    };
  });

  describe('testing `supportsInterface`', () => {
    it('should return true for supported interface IDs', async () => {
      expect(await context.tokenCallbacks.supportsInterface(INTERFACE_ID_LSP17Extension)).to.be
        .true; // LSP17Extension interface ID
      expect(await context.tokenCallbacks.supportsInterface('0x01ffc9a7')).to.be.true; // ERC721Holder interface ID
      expect(await context.tokenCallbacks.supportsInterface('0x4e2312e0')).to.be.true; // ERC1155Holder interface ID
    });
  });
});
