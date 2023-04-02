// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

library EIP191Signer {
    function toDataWithIntendedValidator(address validator, bytes memory dataToSign)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked("\x19\x00", validator, dataToSign));
    }
}
