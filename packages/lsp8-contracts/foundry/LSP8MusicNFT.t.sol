// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {
    LSP8MusicNFTAbstract
} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTAbstract.sol";
import {
    LSP8IdentifiableDigitalAsset
} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP33_METADATA_KEY
} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _LSP8_TOKENID_FORMAT_NUMBER
} from "../contracts/LSP8Constants.sol";

/// @dev Concrete test implementation of `LSP8MusicNFTAbstract`.
contract MockLSP8MusicNFT is LSP8MusicNFTAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            2, // LSP4TokenType: Collection (LSP33 SHOULD rule for a release)
            _LSP8_TOKENID_FORMAT_NUMBER
        )
        LSP8MusicNFTAbstract()
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public onlyOwner {
        _mint(to, tokenId, force, data);
    }
}

contract LSP8MusicNFTTest is Test {
    MockLSP8MusicNFT lsp8;

    address artist = address(this);
    address collector = vm.addr(101);
    address other = vm.addr(102);

    bytes32 tokenId1 = bytes32(uint256(1));

    function setUp() public {
        lsp8 = new MockLSP8MusicNFT("Music Collection", "MUSIC", artist);
        lsp8.mint(collector, tokenId1, true, "");
    }

    // --- LSP33 carrier marker ---

    function test_SupportedStandardsSet() public {
        assertEq(
            lsp8.getData(_LSP33_SUPPORTED_STANDARDS_KEY),
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }

    // --- Release-level metadata lives at the contract scope ---

    function test_OwnerCanSetReleaseLSP4Metadata() public {
        lsp8.setData(_LSP4_METADATA_KEY, hex"cafebabe");
        assertEq(lsp8.getData(_LSP4_METADATA_KEY), hex"cafebabe");
    }

    function test_OwnerCanSetReleaseLSP33Metadata() public {
        lsp8.setData(_LSP33_METADATA_KEY, hex"deadbeef");
        assertEq(lsp8.getData(_LSP33_METADATA_KEY), hex"deadbeef");
    }

    function test_NonOwnerCannotSetReleaseMetadata() public {
        vm.prank(other);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp8.setData(_LSP4_METADATA_KEY, hex"00");
    }

    // --- Per-track metadata lives at the per-tokenId scope ---

    function test_OwnerCanSetTrackLSP4Metadata() public {
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"11223344");
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY),
            hex"11223344"
        );
    }

    function test_OwnerCanSetTrackLSP33Metadata() public {
        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, hex"aabbccdd");
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP33_METADATA_KEY),
            hex"aabbccdd"
        );
    }

    function test_TokenOwnerCannotSetTrackMetadata() public {
        // LSP33 does not grant collectors metadata rights — they hold the
        // unit, not the authorship. Access control stays with `owner()`.
        vm.prank(collector);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP4_METADATA_KEY,
            hex"01d00e30"
        );
    }

    function test_OtherUserCannotSetTrackMetadata() public {
        vm.prank(other);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"00");
    }
}
