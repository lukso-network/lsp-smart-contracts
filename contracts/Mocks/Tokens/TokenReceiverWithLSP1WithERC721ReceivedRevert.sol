// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ILSP1UniversalReceiver} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// modules
import {ERC165Storage} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// constants
import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract TokenReceiverWithLSP1WithERC721ReceivedRevert is
    ERC165Storage,
    ILSP1UniversalReceiver,
    IERC721Receiver
{
    event UniversalReceiverCalled(bytes32 typeId, bytes data);

    constructor() {
        _registerInterface(_INTERFACEID_LSP1);
    }

    receive() external payable {}

    fallback() external payable {}

    function universalReceiver(bytes32 typeId, bytes memory data)
        external
        payable
        override
        returns (bytes memory returnValue)
    {
        emit UniversalReceiverCalled(typeId, data);

        return "thanks for calling";
    }

    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        revert("ERC721Receiver: transfer rejected");
    }
}
