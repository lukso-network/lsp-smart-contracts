// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP7DigitalAsset
} from "../../LSP7DigitalAsset.sol";

import {
    ERC725Y_MsgValueDisallowed,
    ERC725Y_DataKeysValuesLengthMismatch,
    ERC725Y_DataKeysValuesEmptyArray
} from "@erc725/smart-contracts-v8/contracts/errors.sol";

// interfaces
import {
    ILSP8IdentifiableDigitalAsset
} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

// constants
import {
    _LSP34_OWNERSHIP_SOURCE_KEY
} from "./LSP7MusicNFTConstants.sol";

import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {
    LSP34ExternalOwnershipActive,
    LSP7MusicNFTUnauthorized
} from "./LSP7MusicNFTErrors.sol";

/// @title LSP7MusicNFTAbstract
/// @dev LSP33 Music NFT extension for LSP7 track tokens. Plug-and-play design:
/// the LSP7 deploys as a plain ERC173-owned contract and becomes linked to a
/// parent LSP8 collection lazily, when the artist writes `LSP34OwnershipSource`
/// via `setData`. Once set, `owner()` resolves dynamically through
/// `LSP8.tokenOwnerOf(tokenId)`, and the parent LSP8 contract is additionally
/// authorized to write metadata (as a router on behalf of the artist).
abstract contract LSP7MusicNFTAbstract is LSP7DigitalAsset {
    /// @param name_ Token name.
    /// @param symbol_ Token symbol.
    /// @param initialOwner_ Initial ERC173 owner (the artist). Acts as `owner()`
    /// until `LSP34OwnershipSource` is set, at which point ownership is
    /// derived from the referenced LSP8 tokenId.
    /// @param isNonDivisible_ Whether the token is non-divisible.
    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            initialOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            isNonDivisible_
        )
    {}

    // --- LSP34 External Ownership ---

    /// @dev Resolves owner dynamically via LSP34. If `LSP34OwnershipSource` is
    /// set, calls `tokenOwnerOf` on the referenced LSP8 to get the current
    /// owner. Otherwise falls back to the standard ERC173 owner.
    function owner()
        public
        view
        virtual
        override
        returns (address)
    {
        (address parent, bytes32 tokenId, bool hasSource) =
            _readOwnershipSource();

        if (hasSource) {
            try
                ILSP8IdentifiableDigitalAsset(parent).tokenOwnerOf(tokenId)
            returns (address tokenOwner) {
                return tokenOwner;
            } catch {
                return super.owner();
            }
        }

        return super.owner();
    }

    /// @dev Reverts when LSP34 external ownership is active.
    /// Falls back to super when LSP34 is not active.
    function transferOwnership(
        address newOwner
    ) public virtual override {
        if (_hasExternalOwnership()) {
            revert LSP34ExternalOwnershipActive();
        }
        super.transferOwnership(newOwner);
    }

    /// @dev Reverts when LSP34 external ownership is active.
    /// Falls back to super when LSP34 is not active.
    function renounceOwnership() public virtual override {
        if (_hasExternalOwnership()) {
            revert LSP34ExternalOwnershipActive();
        }
        super.renounceOwnership();
    }

    // --- Parent Collection Authorization ---

    /// @dev Allows calls from the resolved owner (via LSP34 or ERC173) or, when
    /// linked, from the parent LSP8 collection contract decoded from
    /// `LSP34OwnershipSource`.
    modifier onlyOwnerOrParentCollection() {
        if (msg.sender != owner()) {
            (address parent, , bool hasSource) = _readOwnershipSource();
            if (!hasSource || msg.sender != parent) {
                revert LSP7MusicNFTUnauthorized(msg.sender);
            }
        }
        _;
    }

    /// @dev Override `setData` to allow calls from both the resolved owner and
    /// the linked parent LSP8 contract.
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override onlyOwnerOrParentCollection {
        if (msg.value != 0) {
            revert ERC725Y_MsgValueDisallowed();
        }
        _setData(dataKey, dataValue);
    }

    /// @dev Override `setDataBatch` to allow calls from both the resolved
    /// owner and the linked parent LSP8 contract.
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override onlyOwnerOrParentCollection {
        if (msg.value != 0) {
            revert ERC725Y_MsgValueDisallowed();
        }
        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }
        if (dataKeys.length == 0) {
            revert ERC725Y_DataKeysValuesEmptyArray();
        }
        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);
            unchecked {
                ++i;
            }
        }
    }

    // --- Minting ---

    /// @dev Mint function restricted to the resolved owner (ERC173 while
    /// standalone, or the LSP8 token owner via LSP34 once linked).
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, amount, force, data);
    }

    // --- Internal Helpers ---

    /// @dev Decodes `LSP34OwnershipSource` from storage. Returns
    /// `(parent, tokenId, hasSource)`. `hasSource` is true only when the data
    /// is at least 52 bytes (20-byte address + 32-byte tokenId, abi.encoded).
    function _readOwnershipSource()
        internal
        view
        returns (address parent, bytes32 tokenId, bool hasSource)
    {
        bytes memory source = _getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        if (source.length >= 52) {
            (parent, tokenId) = abi.decode(source, (address, bytes32));
            hasSource = true;
        }
    }

    /// @dev Returns true if LSP34 external ownership is active.
    function _hasExternalOwnership() internal view returns (bool) {
        return _getData(_LSP34_OWNERSHIP_SOURCE_KEY).length >= 52;
    }
}
