// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ERC721Holder
} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
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

contract TokenReceiverWithLSP1WithERC721ReceivedInvalid is
    ERC165Storage,
    ILSP1UniversalReceiver,
    ERC721Holder
{
    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    receive() external payable {}

    fallback() external payable {}

    function universalReceiver(
        bytes32 typeId,
        bytes memory data
    ) external payable override returns (bytes memory returnValue) {
        emit UniversalReceiver(msg.sender, msg.value, typeId, data, "");

        return "thanks for calling";
    }

    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes memory /* data */
    ) public pure override returns (bytes4) {
        return 0xdeadbeef;
    }
}
