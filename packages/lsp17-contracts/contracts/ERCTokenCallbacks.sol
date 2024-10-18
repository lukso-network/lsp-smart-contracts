// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ERC721Holder,
    IERC721Receiver
} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import {
    ERC1155Holder,
    ERC1155Receiver
} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import {
    IERC777Recipient
} from "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";

import {
    LSP17Extension
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extension.sol";

/**
 * @dev LSP17 Extension that can be attached to a LSP17Extendable contract
 * to allow it to receive ERC721 tokens via `safeTransferFrom`.
 */
// solhint-disable-next-line no-empty-blocks
contract ERCTokenCallbacks is
    ERC721Holder,
    ERC1155Holder,
    IERC777Recipient,
    LSP17Extension
{
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @notice Implements ERC165 interface support for ERC1155TokenReceiver, ERC721TokenReceiver and IERC165.
     * @param interfaceId Id of the interface.
     * @return if the interface is supported.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Receiver, LSP17Extension)
        returns (bool)
    {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
