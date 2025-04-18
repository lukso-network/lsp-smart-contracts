import { expect } from 'chai';
import { ethers as hardhatEthers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { INTERFACE_ID_LSP17Extension } from '../constants';

describe('testing `ERCTokenCallbacks`', () => {
  let context: {
    tokenCallbacks: any; // TODO: improve typing
    owner: SignerWithAddress;
  };

  before(async () => {
    const ERCTokenCallbacks__factory = await hardhatEthers.getContractFactory('ERCTokenCallbacks');
    const [owner] = await hardhatEthers.getSigners();
    const tokenCallbacks = await ERCTokenCallbacks__factory.connect(owner).deploy();

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
