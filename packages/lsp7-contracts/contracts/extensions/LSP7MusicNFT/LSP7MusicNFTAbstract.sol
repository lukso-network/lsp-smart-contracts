// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";

import {ERC725Y} from "@erc725/smart-contracts-v8/contracts/ERC725Y.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP34_OWNERSHIP_SOURCE_KEY
} from "./LSP7MusicNFTConstants.sol";

import {_LSP4_TOKEN_TYPE_NFT} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {LSP34NotAuthorizedToMint} from "./LSP7MusicNFTErrors.sol";

/// @dev Minimal ERC173 interface used to resolve the minter when
/// `LSP34OwnershipSource` points to a plain owned contract
/// (i.e. `tokenId == bytes32(0)`).
interface IERC173 {
    function owner() external view returns (address);
}

/// @dev Minimal LSP8 interface used to resolve the minter when
/// `LSP34OwnershipSource` points to an LSP8 tokenId
/// (i.e. `tokenId != bytes32(0)`). Declared locally, like `IERC173`, so
/// that the LSP7 package does not need the LSP8 package as a dependency.
interface ILSP8TokenOwnerOf {
    function tokenOwnerOf(bytes32 tokenId) external view returns (address);
}

/// @title LSP7MusicNFTAbstract
/// @dev LSP33 Music NFT carrier for an LSP7 track token combined with LSP34
/// minting-rights delegation.
///
/// The contract sets the `SupportedStandards:LSP33MusicNFT` marker at
/// construction and exposes a `mint` function that honours LSP34: in addition
/// to the ERC173 `owner()`, minting is allowed by the address resolved from
/// `LSP34OwnershipSource` when it has been set. Everything else — ownership
/// transfer, renouncement, and ERC725Y access control for `setData` — follows
/// the standard LSP7 / ERC725Y rules as required by LSP34.
abstract contract LSP7MusicNFTAbstract is LSP7DigitalAsset {
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
    {
        ERC725Y._setData(
            _LSP33_SUPPORTED_STANDARDS_KEY,
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }

    /// @notice Mint `amount` tokens to `to`.
    /// @dev Authorisation follows LSP34: callable by the contract's own ERC173
    /// `owner()` or, when `LSP34OwnershipSource` is set, by the address
    /// resolved from that source.
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual {
        if (msg.sender != owner() && msg.sender != _resolveLSP34Minter()) {
            revert LSP34NotAuthorizedToMint(msg.sender);
        }
        _mint(to, amount, force, data);
    }

    /// @dev Returns the address authorised to mint via `LSP34OwnershipSource`.
    /// Returns `address(0)` when the source is unset or its value is not
    /// exactly 64 bytes long. Reverts, granting no minting rights, when a
    /// 64-byte value is not a valid `abi.encode(address, bytes32)` (non-zero
    /// upper 96 bits in the address word) or when the source query reverts
    /// (e.g. burned or nonexistent `tokenId`, source without code). `mint`
    /// only calls this for callers other than `owner()`.
    ///
    /// Resolution rules per LSP34:
    /// - If `tokenId != bytes32(0)`, query `tokenOwnerOf(tokenId)` on the source.
    /// - If `tokenId == bytes32(0)`, query `owner()` on the source.
    function _resolveLSP34Minter() internal view returns (address) {
        bytes memory source = _getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        if (source.length != 64) {
            return address(0);
        }

        (address sourceContract, bytes32 tokenId) = abi.decode(
            source,
            (address, bytes32)
        );

        if (tokenId == bytes32(0)) {
            return IERC173(sourceContract).owner();
        }
        return ILSP8TokenOwnerOf(sourceContract).tokenOwnerOf(tokenId);
    }
}
