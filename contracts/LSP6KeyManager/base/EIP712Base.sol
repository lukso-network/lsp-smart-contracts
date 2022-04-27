// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EIP712Base {
    bytes32 internal constant _EIP712_DOMAIN =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    bytes32 public constant KEYMANAGER_TYPEHASH = keccak256("KeyManager(uint256 nonce,bytes data)");

    function recover(
        uint256 nonce,
        bytes memory data,
        bytes memory signature
    ) public view returns (address) {
        bytes32 structHash = keccak256(abi.encode(KEYMANAGER_TYPEHASH, nonce, keccak256(data)));
        bytes32 digest = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR(), structHash);
        address recoveredAddress = ECDSA.recover(digest, signature);
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _EIP712_DOMAIN,
                    keccak256(bytes("KeyManager")),
                    keccak256(bytes("LSP6")),
                    block.chainid,
                    address(this)
                )
            );
    }
}
