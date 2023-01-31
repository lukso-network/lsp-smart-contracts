// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../../../contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol";

contract LSP16Mock is LSP16UniversalFactory {
    function generateSalt(
        bool initializable,
        bytes memory initializeCallData,
        bytes32 providedSalt
    ) public pure virtual returns (bytes32) {
        return _generateSalt(initializable, initializeCallData, providedSalt);
    }
}
