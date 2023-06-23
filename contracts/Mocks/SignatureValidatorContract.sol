// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

/**
 * @dev sample contract that implements ERC1271 (Standard Signature Validation Method for Contracts)
 *  used to test the permission ALLOWEDSTANDARDS
 *
 * implementation code taken from: https://eips.ethereum.org/EIPS/eip-1271
 */
contract SignatureValidator is IERC1271, ERC165Storage {
    constructor() {
        _registerInterface(type(IERC1271).interfaceId);
    }

    /**
     * @notice Verifies that the signer is the owner of the signing contract.
     */
    function isValidSignature(
        bytes32 /* messageHash */,
        bytes calldata /* signature */
    ) external pure override returns (bytes4) {
        // always return true (just for testing)
        return 0x1626ba7e;
    }
}
