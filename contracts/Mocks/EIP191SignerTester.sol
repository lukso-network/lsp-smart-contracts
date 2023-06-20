// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EIP191SignerTester {
    function toDataWithIntendedValidator(
        address validator,
        bytes memory dataToSign
    ) public pure returns (bytes32) {
        return ECDSA.toDataWithIntendedValidatorHash(validator, dataToSign);
    }
}
