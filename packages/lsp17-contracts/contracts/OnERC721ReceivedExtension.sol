// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ERC721Holder
} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {
    LSP17Extension
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extension.sol";

/**
 * @dev LSP17 Extension that can be attached to a LSP17Extendable contract
 * to allow it to receive ERC721 tokens via `safeTransferFrom`.
 */
// solhint-disable-next-line no-empty-blocks
contract OnERC721ReceivedExtension is ERC721Holder, LSP17Extension {}
