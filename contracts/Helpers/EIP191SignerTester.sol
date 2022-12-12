// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {EIP191Signer} from "../Custom/EIP191Signer.sol";

contract EIP191SignerTester {
    function toDataWithIntendedValidator(address validator, bytes memory dataToSign)
        public
        pure
        returns (bytes32)
    {
        return EIP191Signer.toDataWithIntendedValidator(validator, dataToSign);
    }
}
