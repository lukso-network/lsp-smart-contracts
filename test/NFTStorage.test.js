const { assert } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const truffleAssert = require("truffle-assertions");

const NFTStorageMerkle = artifacts.require("NFTStorageMerkle");

contract("NFTStorageMerkle", async (accounts) => {
  context("Testing Merkle Tree", async () => {
    let owner = accounts[0];
    let nftList = [
      accounts[1],
      accounts[2],
      accounts[3],
      accounts[4], // verify this leaf
      accounts[5],
      accounts[6],
      accounts[7],
      accounts[8],
    ];

    let nftStorage;
    let leaves;
    let merkletree;

    before(async () => {
      nftStorage = await NFTStorageMerkle.new({ from: owner });

      leaves = nftList.map((x) => keccak256(x));
      merkletree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    });

    it("Display Merkle Tree in CLI", async () => {
      console.log(merkletree.toString());
    });

    it("Should return 8 for leaves count", async () => {
      let count = merkletree.getHexLeaves().length;
      assert.equal(count, 8, "not the same number of leaves");
    });

    it("Keccak256 hash should match for the first NFT address", async () => {
      let firstNFT = merkletree.getHexLeaves()[0];

      assert.equal(
        firstNFT,
        web3.utils.sha3(nftList[0]),
        "Not the same keccak256 hash"
      );
    });

    it("Should verify the proof in the smart contract", async () => {
      let root = merkletree.getHexRoot();
      let leaf = merkletree.getHexLeaves()[3];
      let proof = merkletree.getHexProof(leaf);

      let result = await nftStorage.verifyMerkleProof(proof, root, leaf);
      assert.isTrue(result, "Merkle Proof invalid");
    });
  });
});
