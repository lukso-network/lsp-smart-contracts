// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract OnERC721ReceivedExtension {
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        return 0x150b7a02;
    }
}
