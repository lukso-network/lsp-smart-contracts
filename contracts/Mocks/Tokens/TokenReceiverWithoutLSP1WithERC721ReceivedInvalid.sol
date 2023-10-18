// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    ERC721Holder
} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract TokenReceiverWithoutLSP1WithERC721ReceivedInvalid is ERC721Holder {
    receive() external payable {}

    fallback() external payable {}

    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes memory /* data */
    ) public pure override returns (bytes4) {
        return 0xdeadbeef;
    }
}
