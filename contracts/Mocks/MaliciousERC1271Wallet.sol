// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {GenericExecutor} from "./GenericExecutor.sol";

/**
 * @dev This contract is used only for testing purposes
 */
contract ERC1271MaliciousMock is GenericExecutor {
    /**
     * @dev Returns a malicious 4-byte value.
     * @return bytes4 The malicious 4-byte magic value.
     */
    function isValidSignature(
        bytes32,
        bytes memory
    ) public pure returns (bytes4) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(
                0,
                0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            )
            return(0, 32)
        }
    }
}
