// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


library LSP6Signer {
    function toLSP6SignedMessageHash(bytes memory message) internal pure returns (bytes32) {
        bytes memory messagePrefixed = abi.encodePacked("\x19LSP6 ExecuteRelayCall:\n", Strings.toString(message.length), message);
        return keccak256(messagePrefixed);
    }

    function toLSP6SignedMessageHash(bytes32 _hash) internal pure returns (bytes32) {
        bytes memory messagePrefixed = abi.encodePacked("\x19LSP6 ExecuteRelayCall:\n32", _hash);
        return keccak256(messagePrefixed);
    }
}