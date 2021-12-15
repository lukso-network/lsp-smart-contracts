import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const keccak256 = require("keccak256");
import { ethers } from "hardhat";
import { NFTStorageMerkle, NFTStorageMerkle__factory } from "../../types";

const { MerkleTree } = require("merkletreejs");

describe("NFTStorageMerkle", () => {
  describe("Testing Merkle Tree", () => {
    let accounts: SignerWithAddress[];
    let owner, nftList;

    let nftStorage: NFTStorageMerkle;
    let leaves;
    let merkletree;

    beforeAll(async () => {
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

    it("Should return 8 for leaves count", () => {
      let count = merkletree.getHexLeaves().length;
      expect(count).toEqual(8);
    });

    it("Keccak256 hash should match for the first NFT address", async () => {
      let firstNFT = merkletree.getHexLeaves()[0];

      expect(firstNFT).toEqual(ethers.utils.keccak256(nftList[0]));
    });

    it("Should verify the proof in the smart contract", async () => {
      let root = merkletree.getHexRoot();
      let leaf = merkletree.getHexLeaves()[3];
      let proof = merkletree.getHexProof(leaf);

      let result = await nftStorage.callStatic.verifyMerkleProof(
        proof,
        root,
        leaf
      );
      expect(result).toBeTruthy();
    });
  });
});
