// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {LSP8MusicNFTAbstract} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "../contracts/LSP8IdentifiableDigitalAsset.sol";

// interfaces
import {ILSP8IdentifiableDigitalAsset} from "../contracts/ILSP8IdentifiableDigitalAsset.sol";
import {IERC725Y} from "@erc725/smart-contracts-v8/contracts/interfaces/IERC725Y.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP33_METADATA_KEY
} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY,
    _LSP4_TOKEN_NAME_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _LSP8_TOKENID_FORMAT_KEY,
    _LSP8_TOKENID_FORMAT_NUMBER
} from "../contracts/LSP8Constants.sol";

// errors
import {LSP4TokenNameNotEditable} from "@lukso/lsp4-contracts/contracts/LSP4Errors.sol";
import {
    LSP8TokenIdFormatNotEditable,
    LSP8TokenIdsDataEmptyArray,
    LSP8TokenIdsDataLengthMismatch
} from "../contracts/LSP8Errors.sol";

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
    address collector2 = vm.addr(103);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));

    function setUp() public {
        lsp8 = new MockLSP8MusicNFT("Music Collection", "MUSIC", artist);
        lsp8.mint(collector, tokenId1, true, "");
        lsp8.mint(collector2, tokenId2, true, "");
    }

    /// @dev Per-track LSP33 setup for two tracks: marker, LSP4Metadata and
    /// LSP33Metadata for track 1, LSP4Metadata for track 2.
    function _trackMetadataBatch()
        internal
        pure
        returns (
            bytes32[] memory tokenIds,
            bytes32[] memory dataKeys,
            bytes[] memory dataValues
        )
    {
        tokenIds = new bytes32[](4);
        dataKeys = new bytes32[](4);
        dataValues = new bytes[](4);

        tokenIds[0] = bytes32(uint256(1));
        dataKeys[0] = _LSP33_SUPPORTED_STANDARDS_KEY;
        dataValues[0] = _LSP33_SUPPORTED_STANDARDS_VALUE;

        tokenIds[1] = bytes32(uint256(1));
        dataKeys[1] = _LSP4_METADATA_KEY;
        dataValues[1] = hex"11223344";

        tokenIds[2] = bytes32(uint256(1));
        dataKeys[2] = _LSP33_METADATA_KEY;
        dataValues[2] = hex"aabbccdd";

        tokenIds[3] = bytes32(uint256(2));
        dataKeys[3] = _LSP4_METADATA_KEY;
        dataValues[3] = hex"55667788";
    }

    // --- LSP33 carrier marker ---

    function test_SupportedStandardsSet() public {
        assertEq(
            lsp8.getData(_LSP33_SUPPORTED_STANDARDS_KEY),
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }

    // --- LSP2 derivation of the data keys (independent of the constants file) ---

    /// @dev LSP2 Mapping key for `SupportedStandards:LSP33MusicNFT`, derived
    /// here so that a wrong literal in the constants file cannot pass.
    /// `bytes20(bytes32)` keeps the first (left-most) 20 bytes.
    function _derivedLSP33MarkerKey() internal pure returns (bytes32) {
        return
            bytes32(
                abi.encodePacked(
                    bytes10(keccak256("SupportedStandards")),
                    bytes2(0),
                    bytes20(keccak256("LSP33MusicNFT"))
                )
            );
    }

    /// @dev Mis-derived marker key published by earlier LSP33 drafts
    /// (last 20 bytes of `keccak256("LSP33MusicNFT")`).
    function _legacyLSP33MarkerKey() internal pure returns (bytes32) {
        return
            bytes32(
                abi.encodePacked(
                    bytes10(keccak256("SupportedStandards")),
                    bytes2(0),
                    bytes20(uint160(uint256(keccak256("LSP33MusicNFT"))))
                )
            );
    }

    function test_LSP33SupportedStandardsKeyIsLSP2Derived() public {
        assertEq(_LSP33_SUPPORTED_STANDARDS_KEY, _derivedLSP33MarkerKey());
        assertEq(
            _LSP33_SUPPORTED_STANDARDS_KEY,
            bytes32(
                0xeafec4d89fa9619884b600003cd4661761f237efa2fead11f43ae543d533ae73
            )
        );
    }

    function test_LSP33SupportedStandardsValueIsBytes4OfName() public {
        assertEq(
            _LSP33_SUPPORTED_STANDARDS_VALUE,
            abi.encodePacked(bytes4(keccak256("LSP33MusicNFT")))
        );
    }

    function test_LSP33MetadataKeyIsLSP2Derived() public {
        assertEq(_LSP33_METADATA_KEY, keccak256("LSP33Metadata"));
    }

    function test_LSP33MarkerWrittenUnderDerivedKeyOnly() public {
        assertEq(
            lsp8.getData(_derivedLSP33MarkerKey()),
            abi.encodePacked(bytes4(keccak256("LSP33MusicNFT")))
        );
        // New deployments must not write the legacy (mis-derived) draft key.
        assertEq(lsp8.getData(_legacyLSP33MarkerKey()).length, 0);
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
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"01d00e30");
    }

    function test_OtherUserCannotSetTrackMetadata() public {
        vm.prank(other);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"00");
    }

    // --- TokenIdDataChanged events for per-track writes ---

    function test_SetTrackMetadataEmitsTokenIdDataChanged() public {
        vm.expectEmit(true, true, true, true, address(lsp8));
        emit ILSP8IdentifiableDigitalAsset.TokenIdDataChanged(
            tokenId1,
            _LSP4_METADATA_KEY,
            hex"11223344"
        );
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"11223344");

        vm.expectEmit(true, true, true, true, address(lsp8));
        emit ILSP8IdentifiableDigitalAsset.TokenIdDataChanged(
            tokenId1,
            _LSP33_METADATA_KEY,
            hex"aabbccdd"
        );
        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, hex"aabbccdd");
    }

    function test_OverwritingAndClearingTrackMetadataEmitsTokenIdDataChanged()
        public
    {
        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, hex"01");

        vm.expectEmit(true, true, true, true, address(lsp8));
        emit ILSP8IdentifiableDigitalAsset.TokenIdDataChanged(
            tokenId1,
            _LSP33_METADATA_KEY,
            hex"02"
        );
        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, hex"02");
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP33_METADATA_KEY),
            hex"02"
        );

        vm.expectEmit(true, true, true, true, address(lsp8));
        emit ILSP8IdentifiableDigitalAsset.TokenIdDataChanged(
            tokenId1,
            _LSP33_METADATA_KEY,
            ""
        );
        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, "");
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP33_METADATA_KEY).length,
            0
        );
    }

    function test_SetTrackMetadataBatchEmitsTokenIdDataChangedPerEntry()
        public
    {
        (
            bytes32[] memory tokenIds,
            bytes32[] memory dataKeys,
            bytes[] memory dataValues
        ) = _trackMetadataBatch();

        for (uint256 i; i < tokenIds.length; ++i) {
            vm.expectEmit(true, true, true, true, address(lsp8));
            emit ILSP8IdentifiableDigitalAsset.TokenIdDataChanged(
                tokenIds[i],
                dataKeys[i],
                dataValues[i]
            );
        }
        lsp8.setDataBatchForTokenIds(tokenIds, dataKeys, dataValues);
    }

    // --- Batch / single getter and setter consistency ---

    function test_BatchAndSingleTrackMetadataGettersAgree() public {
        (
            bytes32[] memory tokenIds,
            bytes32[] memory dataKeys,
            bytes[] memory dataValues
        ) = _trackMetadataBatch();
        lsp8.setDataBatchForTokenIds(tokenIds, dataKeys, dataValues);

        bytes[] memory batchValues = lsp8.getDataBatchForTokenIds(
            tokenIds,
            dataKeys
        );
        assertEq(batchValues.length, dataValues.length);
        for (uint256 i; i < tokenIds.length; ++i) {
            assertEq(batchValues[i], dataValues[i]);
            assertEq(
                lsp8.getDataForTokenId(tokenIds[i], dataKeys[i]),
                dataValues[i]
            );
        }

        // A single write is visible through the batch getter as well.
        lsp8.setDataForTokenId(tokenId2, _LSP33_METADATA_KEY, hex"0badf00d");
        bytes32[] memory singleTokenId = new bytes32[](1);
        singleTokenId[0] = tokenId2;
        bytes32[] memory singleKey = new bytes32[](1);
        singleKey[0] = _LSP33_METADATA_KEY;
        assertEq(
            lsp8.getDataBatchForTokenIds(singleTokenId, singleKey)[0],
            hex"0badf00d"
        );
    }

    function test_TrackMetadataIsScopedPerTokenId() public {
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"aa");

        // Neither another track nor the release scope sees the value.
        assertEq(
            lsp8.getDataForTokenId(tokenId2, _LSP4_METADATA_KEY).length,
            0
        );
        assertEq(lsp8.getData(_LSP4_METADATA_KEY).length, 0);

        // Release-level and other-track writes leave track 1 untouched.
        lsp8.setData(_LSP4_METADATA_KEY, hex"bb");
        lsp8.setDataForTokenId(tokenId2, _LSP4_METADATA_KEY, hex"cc");
        assertEq(lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY), hex"aa");
        assertEq(lsp8.getData(_LSP4_METADATA_KEY), hex"bb");
        assertEq(lsp8.getDataForTokenId(tokenId2, _LSP4_METADATA_KEY), hex"cc");
    }

    // --- Batch access control and input validation ---

    function test_NonOwnerCannotSetTrackMetadataBatch() public {
        (
            bytes32[] memory tokenIds,
            bytes32[] memory dataKeys,
            bytes[] memory dataValues
        ) = _trackMetadataBatch();

        // Neither a track holder nor an unrelated account may write.
        address[3] memory callers = [collector, collector2, other];
        for (uint256 i; i < callers.length; ++i) {
            vm.prank(callers[i]);
            vm.expectRevert("Ownable: caller is not the owner");
            lsp8.setDataBatchForTokenIds(tokenIds, dataKeys, dataValues);
        }

        bytes[] memory stored = lsp8.getDataBatchForTokenIds(
            tokenIds,
            dataKeys
        );
        for (uint256 i; i < stored.length; ++i) {
            assertEq(stored[i].length, 0);
        }
    }

    function test_NonOwnerCannotSetReleaseMetadataBatch() public {
        bytes32[] memory dataKeys = new bytes32[](1);
        dataKeys[0] = _LSP33_METADATA_KEY;
        bytes[] memory dataValues = new bytes[](1);
        dataValues[0] = hex"00";

        vm.prank(collector);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp8.setDataBatch(dataKeys, dataValues);
        assertEq(lsp8.getData(_LSP33_METADATA_KEY).length, 0);
    }

    function test_TrackMetadataBatchRejectsMismatchedOrEmptyArrays() public {
        vm.expectRevert(LSP8TokenIdsDataLengthMismatch.selector);
        lsp8.setDataBatchForTokenIds(
            new bytes32[](2),
            new bytes32[](1),
            new bytes[](2)
        );

        vm.expectRevert(LSP8TokenIdsDataLengthMismatch.selector);
        lsp8.setDataBatchForTokenIds(
            new bytes32[](1),
            new bytes32[](1),
            new bytes[](2)
        );

        vm.expectRevert(LSP8TokenIdsDataEmptyArray.selector);
        lsp8.setDataBatchForTokenIds(
            new bytes32[](0),
            new bytes32[](0),
            new bytes[](0)
        );

        vm.expectRevert(LSP8TokenIdsDataLengthMismatch.selector);
        lsp8.getDataBatchForTokenIds(new bytes32[](2), new bytes32[](1));
    }

    // --- Atomicity of reverted batches ---

    function test_ReleaseMetadataBatchIsAtomic() public {
        bytes32[] memory dataKeys = new bytes32[](2);
        dataKeys[0] = _LSP4_METADATA_KEY;
        bytes[] memory dataValues = new bytes[](2);
        dataValues[0] = hex"cafe";

        // A protected key later in the batch reverts the whole batch, so the
        // earlier LSP4Metadata entry is not stored either.
        dataKeys[1] = _LSP4_TOKEN_NAME_KEY;
        dataValues[1] = bytes("Renamed");
        vm.expectRevert(LSP4TokenNameNotEditable.selector);
        lsp8.setDataBatch(dataKeys, dataValues);
        assertEq(lsp8.getData(_LSP4_METADATA_KEY).length, 0);

        dataKeys[1] = _LSP8_TOKENID_FORMAT_KEY;
        dataValues[1] = abi.encode(uint256(1));
        vm.expectRevert(LSP8TokenIdFormatNotEditable.selector);
        lsp8.setDataBatch(dataKeys, dataValues);
        assertEq(lsp8.getData(_LSP4_METADATA_KEY).length, 0);
    }

    // --- LSP33 marker event at deployment ---

    function test_ConstructorEmitsLSP33MarkerDataChanged() public {
        address predicted = computeCreateAddress(
            address(this),
            vm.getNonce(address(this))
        );

        vm.expectEmit(true, true, true, true, predicted);
        emit IERC725Y.DataChanged(
            _LSP33_SUPPORTED_STANDARDS_KEY,
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
        MockLSP8MusicNFT deployed = new MockLSP8MusicNFT(
            "Music Collection",
            "MUSIC",
            artist
        );

        assertEq(address(deployed), predicted);
    }
}
