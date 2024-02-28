// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ILSP1UniversalReceiver
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {
    _INTERFACEID_LSP1
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";

contract TokenReceiverWithLSP1Revert is ERC165Storage, ILSP1UniversalReceiver {
    function addLSP1Support() public {
        _registerInterface(_INTERFACEID_LSP1);
    }

    function universalReceiver(
        bytes32 /*typeId*/,
        bytes memory /*data*/
    ) external payable override returns (bytes memory) {
        revert("I reverted");
    }
}
