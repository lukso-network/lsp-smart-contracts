// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {
    MerkleProof
} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NFTStorageMerkle {
    function verifyMerkleProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    ) public pure returns (bool) {
        return MerkleProof.verify(_proof, _root, _leaf);
    }
}
