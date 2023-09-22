// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";

contract LSP6ExecuteUnrestrictedController is LSP6KeyManager {
    constructor(address target_) LSP6KeyManager(target_) {}

    function transferLYXToEOA(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function transferLYXToUP(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function transferTokensToRandomUP(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function transferTokensToRandomEOA(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function transferNFTToRandomUP(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    function transferNFTToRandomEOA(
        bytes calldata payload
    ) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }
}
