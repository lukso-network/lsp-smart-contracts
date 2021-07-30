// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { PatriciaTree } from "solidity-patricia-tree/contracts/tree.sol";


contract NFTStorageMerkle {

    function verifyMerkleProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    )
        public
        pure
        returns (bool)
    {
        return MerkleProof.verify(_proof, _root, _leaf);
    }

}

contract NFTStoragePatricia {
    using PatriciaTree for PatriciaTree.Tree;

    PatriciaTree.Tree _storage;

    function addNFT(bytes memory key, bytes memory value) public {
        _storage.insert(key, value);
    }

    function getNFT(bytes memory key) public view returns (bytes memory) {
        return _storage.get(key);
    }

    function doesInclude(bytes memory _nftKey) public view returns (bool) {
        return _storage.doesInclude(_nftKey);
    }

    // the key for an nft is represented by the keccak256 hash of its address
    function createNFTKey(address _nftAddress) public pure returns (bytes32) {
        return keccak256(abi.encode(_nftAddress));
    }

    function getProof(bytes memory _nftKey) public view returns (uint branchMask, bytes32[] memory siblings) {
        (branchMask, siblings) = _storage.getProof(_nftKey);
    }

    function getRootHash() public view returns (bytes32) {
        return _storage.getRootHash();
    }

    function verifyPatriciaProof(
        bytes32 _rootHash, 
        bytes memory _key,
        bytes memory _value,
        uint _branchMask,
        bytes32[] memory _siblings
    ) 
        public
        pure
    {
        PatriciaTree.verifyProof(_rootHash, _key, _value, _branchMask, _siblings);
    }
}
