import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { NFTStorageMerkle, NFTStorageMerkle__factory } from '../../types';

describe('NFTStorageMerkle', () => {
  describe('Testing Merkle Tree', () => {
    let accounts: SignerWithAddress[];
    let owner, nftList;

    let nftStorage: NFTStorageMerkle;
    let leaves;
    let merkletree;

    before(async () => {
      accounts = await ethers.getSigners();
      owner = accounts[0];
      nftList = [
        accounts[1].address,
        accounts[2].address,
        accounts[3].address,
        accounts[4].address, // verify this leaf
        accounts[5].address,
        accounts[6].address,
        accounts[7].address,
        accounts[8].address,
      ];

      nftStorage = await new NFTStorageMerkle__factory(owner).deploy();

      leaves = nftList.map((x) => keccak256(x));
      merkletree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    });

    it('Should return 8 for leaves count', () => {
      const count = merkletree.getHexLeaves().length;
      expect(count).to.equal(8);
    });

    it('Keccak256 hash should match for the first NFT address', async () => {
      const firstNFT = merkletree.getHexLeaves()[0];

      expect(firstNFT).to.equal(ethers.utils.keccak256(nftList[0]));
    });

    it('Should verify the proof in the smart contract', async () => {
      const root = merkletree.getHexRoot();
      const leaf = merkletree.getHexLeaves()[3];
      const proof = merkletree.getHexProof(leaf);

      const result = await nftStorage.callStatic.verifyMerkleProof(proof, root, leaf);
      expect(result).to.be.true;
    });
  });
});
