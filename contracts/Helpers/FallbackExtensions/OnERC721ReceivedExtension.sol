// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev This contract is used only for testing purposes
 */
contract OnERC721ReceivedExtension {
    // solhint-disable
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return 0x150b7a02;
    }
}
