// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ERC721Holder
} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract TokenReceiverWithoutLSP1WithERC721Received is ERC721Holder {
    receive() external payable {}

    fallback() external payable {}

    // the onERC721Received function is inherited from ERC721Holder
}
