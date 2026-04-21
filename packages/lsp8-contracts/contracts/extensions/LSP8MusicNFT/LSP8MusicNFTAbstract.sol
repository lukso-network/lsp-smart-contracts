// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP8IdentifiableDigitalAsset
} from "../../LSP8IdentifiableDigitalAsset.sol";

import {
    ERC725Y
} from "@erc725/smart-contracts-v8/contracts/ERC725Y.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE
} from "./LSP8MusicNFTConstants.sol";

/// @title LSP8MusicNFTAbstract
/// @dev LSP33 Music NFT carrier for an LSP8 collection.
///
/// The only responsibility of this extension is to mark the LSP8 collection as
/// an LSP33 carrier by writing `SupportedStandards:LSP33MusicNFT` at
/// construction. All other behaviour — including per-tokenId storage of
/// `LSP4Metadata` / `LSP33Metadata` via `setDataForTokenId` — is provided by
/// the standard LSP8 base contract and is already sufficient for LSP33.
abstract contract LSP8MusicNFTAbstract is LSP8IdentifiableDigitalAsset {
    constructor() {
        ERC725Y._setData(
            _LSP33_SUPPORTED_STANDARDS_KEY,
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }
}
