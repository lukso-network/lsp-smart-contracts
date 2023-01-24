// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

// constants
import {_INTERFACEID_LSP1} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract TokenReceiverWithoutLSP1WithERC721Received is ERC721Holder {
    event UniversalReceiverCalled(bytes32 typeId, bytes data);

    receive() external payable {}

    fallback() external payable {}

    // the onERC721Received function is inherited from ERC721Holder
}
