// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { PatriciaTree } from "solidity-patricia-tree/contracts/tree.sol";

contract NFTStorage {
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
}