// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP7DigitalAsset
} from "../../LSP7DigitalAsset.sol";

import {
    ERC725Y
} from "@erc725/smart-contracts-v8/contracts/ERC725Y.sol";

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
    _LSP34_OWNERSHIP_SOURCE_KEY,
    _LSP8_REFERENCE_CONTRACT_KEY
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
/// @dev LSP33 Music NFT extension for LSP7 track tokens. Implements LSP34 external
/// ownership resolution and parent collection authorization for metadata writes.
abstract contract LSP7MusicNFTAbstract is LSP7DigitalAsset {
    /// @param name_ Token name.
    /// @param symbol_ Token symbol.
    /// @param lsp8Contract_ The parent LSP8 collection address.
    /// @param tokenId_ The LSP8 tokenId this LSP7 represents.
    /// @param isNonDivisible_ Whether the token is non-divisible.
    constructor(
        string memory name_,
        string memory symbol_,
        address lsp8Contract_,
        bytes32 tokenId_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            lsp8Contract_, // Initial owner is the LSP8 contract (will be resolved via LSP34)
            _LSP4_TOKEN_TYPE_NFT,
            isNonDivisible_
        )
    {
        // Set LSP34OwnershipSource to (lsp8Contract, tokenId)
        ERC725Y._setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(lsp8Contract_, tokenId_)
        );

        // Set LSP8ReferenceContract to (lsp8Contract, tokenId)
        ERC725Y._setData(
            _LSP8_REFERENCE_CONTRACT_KEY,
            abi.encode(lsp8Contract_, tokenId_)
        );
    }

    // --- LSP34 External Ownership ---

    /// @dev Resolves owner dynamically via LSP34. If LSP34OwnershipSource is set,
    /// calls tokenOwnerOf on the parent LSP8 to get the current owner.
    function owner()
        public
        view
        virtual
        override
        returns (address)
    {
        bytes memory ownershipSource = _getData(_LSP34_OWNERSHIP_SOURCE_KEY);

        if (ownershipSource.length >= 52) {
            (address lsp8Address, bytes32 tokenId) = abi.decode(
                ownershipSource,
                (address, bytes32)
            );

            try
                ILSP8IdentifiableDigitalAsset(lsp8Address).tokenOwnerOf(
                    tokenId
                )
            returns (address tokenOwner) {
                return tokenOwner;
            } catch {
                return super.owner();
            }
        }

        return super.owner();
    }

    /// @dev Reverts when LSP34 external ownership is active.
    function transferOwnership(
        address /* newOwner */
    ) public virtual override {
        if (_hasExternalOwnership()) {
            revert LSP34ExternalOwnershipActive();
        }
        // This branch won't be reached when LSP34 is active,
        // but we still revert to be safe since onlyOwner is checked in parent
        revert LSP34ExternalOwnershipActive();
    }

    /// @dev Reverts when LSP34 external ownership is active.
    function renounceOwnership() public virtual override {
        if (_hasExternalOwnership()) {
            revert LSP34ExternalOwnershipActive();
        }
        revert LSP34ExternalOwnershipActive();
    }

    // --- Parent Collection Authorization ---

    /// @dev Modifier that allows calls from the resolved owner (via LSP34) or the parent LSP8 collection contract.
    modifier onlyOwnerOrParentCollection() {
        if (msg.sender != owner()) {
            bytes memory refData = _getData(_LSP8_REFERENCE_CONTRACT_KEY);
            if (refData.length >= 20) {
                (address lsp8Address, ) = abi.decode(refData, (address, bytes32));
                if (msg.sender != lsp8Address) {
                    revert LSP7MusicNFTUnauthorized(msg.sender);
                }
            } else {
                revert LSP7MusicNFTUnauthorized(msg.sender);
            }
        }
        _;
    }

    /// @dev Override setData to allow calls from both the owner (via LSP34) and the parent LSP8 contract.
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override onlyOwnerOrParentCollection {
        if (msg.value != 0) {
            revert ERC725Y_MsgValueDisallowed();
        }
        _setData(dataKey, dataValue);
    }

    /// @dev Override setDataBatch to allow calls from both the owner and the parent LSP8 contract.
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

    /// @dev Mint function restricted to owner (resolved via LSP34).
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, amount, force, data);
    }

    // --- Internal Helpers ---

    /// @dev Returns true if LSP34 external ownership is active.
    function _hasExternalOwnership() internal view returns (bool) {
        bytes memory ownershipSource = _getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        return ownershipSource.length >= 52;
    }
}
