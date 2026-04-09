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
    _LSP33_OWNABLE_TRACK_TOKEN_KEY,
    _LSP33_METADATA_KEY
} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTConstants.sol";
import {
    _LSP4_TOKEN_TYPE_COLLECTION
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {
    _LSP8_REFERENCE_CONTRACT,
    _LSP8_TOKENID_FORMAT_NUMBER
} from "../contracts/LSP8Constants.sol";

// errors
import {
    LSP33BidirectionalLinkMismatch,
    LSP33NotTokenOwner
} from "../contracts/extensions/LSP8MusicNFT/LSP8MusicNFTErrors.sol";

// --- Mock Contracts ---

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
            2, // LSP4TokenType: Collection
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

/// @dev Mock LSP7 that responds to getData/setData for testing
contract MockLSP7TrackToken {
    mapping(bytes32 => bytes) private _data;
    address public parentLSP8;
    bytes32 public parentTokenId;
    bool public shouldRevert;

    constructor(address _parentLSP8, bytes32 _parentTokenId) {
        parentLSP8 = _parentLSP8;
        parentTokenId = _parentTokenId;
        // Set LSP8ReferenceContract pointing back
        _data[_LSP8_REFERENCE_CONTRACT] = abi.encode(
            _parentLSP8,
            _parentTokenId
        );
    }

    function getData(
        bytes32 dataKey
    ) external view returns (bytes memory) {
        if (shouldRevert) revert("MockLSP7: reverted");
        return _data[dataKey];
    }

    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) external payable {
        if (shouldRevert) revert("MockLSP7: reverted");
        _data[dataKey] = dataValue;
    }

    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }

    function setReferenceContract(
        address lsp8Addr,
        bytes32 tokenId
    ) external {
        _data[_LSP8_REFERENCE_CONTRACT] = abi.encode(lsp8Addr, tokenId);
    }
}

/// @dev Mock LSP7 with no reference contract set (for link verification failure)
contract MockLSP7NoRef {
    function getData(bytes32) external pure returns (bytes memory) {
        return "";
    }

    function setData(bytes32, bytes memory) external payable {}
}

// --- Tests ---

contract LSP8MusicNFTTest is Test {
    MockLSP8MusicNFT lsp8;
    MockLSP7TrackToken lsp7;

    address owner = address(this);
    address user1 = vm.addr(101);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));

    function setUp() public {
        lsp8 = new MockLSP8MusicNFT("Music Collection", "MUSIC", owner);
        lsp8.mint(user1, tokenId1, true, "");

        // Create LSP7 track token that points back to this LSP8 + tokenId1
        lsp7 = new MockLSP7TrackToken(address(lsp8), tokenId1);
    }

    // --- SupportedStandards ---

    function test_SupportedStandardsSet() public {
        bytes memory value = lsp8.getData(_LSP33_SUPPORTED_STANDARDS_KEY);
        assertEq(value, _LSP33_SUPPORTED_STANDARDS_VALUE);
    }

    // --- Bidirectional Link Verification ---

    function test_SetOwnableTrackTokenWithValidLink() public {
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        bytes memory stored = lsp8.getDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY
        );
        assertEq(stored, abi.encodePacked(address(lsp7)));
    }

    function test_RevertSetOwnableTrackTokenWithInvalidLink() public {
        MockLSP7NoRef badLsp7 = new MockLSP7NoRef();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP33BidirectionalLinkMismatch.selector,
                address(badLsp7),
                tokenId1
            )
        );
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(badLsp7))
        );
    }

    function test_RevertSetOwnableTrackTokenWrongTokenId() public {
        // lsp7 points to tokenId1, but we try to link it to tokenId2
        lsp8.mint(user1, tokenId2, true, "");

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP33BidirectionalLinkMismatch.selector,
                address(lsp7),
                tokenId2
            )
        );
        lsp8.setDataForTokenId(
            tokenId2,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );
    }

    // --- Token Owner Access Control ---

    function test_ContractOwnerCannotSetDataForTokenId() public {
        // Contract owner (address(this)) is NOT the token owner (user1)
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP33NotTokenOwner.selector,
                address(this),
                tokenId1,
                user1
            )
        );
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );
    }

    // --- Read Proxy ---

    function test_ReadProxyReturnsLSP7DataForLSP4Metadata() public {
        // Link LSP7 to tokenId1
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Set metadata on the mock LSP7 directly
        lsp7.setData(_LSP4_METADATA_KEY, hex"cafebabe");

        // Read via LSP8 should return LSP7's data
        bytes memory result = lsp8.getDataForTokenId(
            tokenId1,
            _LSP4_METADATA_KEY
        );
        assertEq(result, hex"cafebabe");
    }

    function test_ReadProxyReturnsLSP7DataForLSP33Metadata() public {
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        lsp7.setData(_LSP33_METADATA_KEY, hex"deadbeef");

        bytes memory result = lsp8.getDataForTokenId(
            tokenId1,
            _LSP33_METADATA_KEY
        );
        assertEq(result, hex"deadbeef");
    }

    function test_ReadProxyFallsBackWhenLSP7Reverts() public {
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        lsp7.setData(_LSP4_METADATA_KEY, hex"ff00ff00");

        // Now make LSP7 revert on reads
        lsp7.setShouldRevert(true);

        // Should fall back to local storage (which is empty)
        bytes memory result = lsp8.getDataForTokenId(
            tokenId1,
            _LSP4_METADATA_KEY
        );
        assertEq(result, "");
    }

    function test_ReadProxyReturnsLocalForNonMetadataKeys() public {
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Set a non-metadata key locally
        bytes32 customKey = keccak256("CustomKey");
        lsp8.setDataForTokenId(tokenId1, customKey, hex"10ca1da7a0");
        vm.stopPrank();

        bytes memory result = lsp8.getDataForTokenId(tokenId1, customKey);
        assertEq(result, hex"10ca1da7a0");
    }

    function test_ReadProxyReturnsLocalWhenNoLink() public {
        // No link set, read should return local data
        bytes memory result = lsp8.getDataForTokenId(
            tokenId1,
            _LSP4_METADATA_KEY
        );
        assertEq(result, "");
    }

    // --- Write Forwarding ---

    function test_WriteForwardsToLSP7ForLSP4Metadata() public {
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"aabb0000");
        vm.stopPrank();

        // Verify it was set on LSP7
        bytes memory lsp7Data = lsp7.getData(_LSP4_METADATA_KEY);
        assertEq(lsp7Data, hex"aabb0000");
    }

    function test_WriteForwardsToLSP7ForLSP33Metadata() public {
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        lsp8.setDataForTokenId(tokenId1, _LSP33_METADATA_KEY, hex"ccdd0033");
        vm.stopPrank();

        bytes memory lsp7Data = lsp7.getData(_LSP33_METADATA_KEY);
        assertEq(lsp7Data, hex"ccdd0033");
    }

    function test_WriteLocallyForNonMetadataKeys() public {
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        bytes32 customKey = keccak256("CustomKey");
        lsp8.setDataForTokenId(tokenId1, customKey, hex"10ca1da7a1");
        vm.stopPrank();

        bytes memory result = lsp8.getDataForTokenId(tokenId1, customKey);
        assertEq(result, hex"10ca1da7a1");
    }

    function test_WriteRevertsWhenLSP7Reverts() public {
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        lsp7.setShouldRevert(true);

        vm.expectRevert("MockLSP7: reverted");
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"fa110000");
        vm.stopPrank();
    }

    // --- Batch Operations with Linked LSP7s ---

    function test_GetDataBatchForTokenIdsWithLinkedLSP7() public {
        // Link LSP7 to tokenId1
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Set metadata on LSP7
        lsp7.setData(_LSP4_METADATA_KEY, hex"ba7c000001");

        // Batch read: one linked (metadata proxied), one unlinked
        bytes32[] memory tokenIds = new bytes32[](2);
        bytes32[] memory dataKeys = new bytes32[](2);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId1;
        dataKeys[0] = _LSP4_METADATA_KEY;
        dataKeys[1] = keccak256("CustomKey");

        // Set local custom key
        vm.prank(user1);
        lsp8.setDataForTokenId(tokenId1, keccak256("CustomKey"), hex"10ca10");

        bytes[] memory results = lsp8.getDataBatchForTokenIds(
            tokenIds,
            dataKeys
        );
        assertEq(results[0], hex"ba7c000001"); // proxied from LSP7
        assertEq(results[1], hex"10ca10"); // local storage
    }

    function test_SetDataBatchForTokenIdsWithLinkedLSP7() public {
        // Link LSP7 to tokenId1
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Batch write: metadata (forwarded to LSP7) + custom key (local)
        bytes32[] memory tokenIds = new bytes32[](2);
        bytes32[] memory dataKeys = new bytes32[](2);
        bytes[] memory dataValues = new bytes[](2);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId1;
        dataKeys[0] = _LSP4_METADATA_KEY;
        dataKeys[1] = keccak256("CustomKey");
        dataValues[0] = hex"ffd00001";
        dataValues[1] = hex"10ca1001";

        lsp8.setDataBatchForTokenIds(tokenIds, dataKeys, dataValues);
        vm.stopPrank();

        // Verify metadata was forwarded to LSP7
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"ffd00001");
        // Verify custom key stored locally
        assertEq(
            lsp8.getDataForTokenId(tokenId1, keccak256("CustomKey")),
            hex"10ca1001"
        );
    }

    // --- Unlinking (setting LSP33OwnableTrackToken to address(0)) ---

    function test_UnlinkBySettingTrackTokenToEmpty() public {
        vm.startPrank(user1);
        // Link first
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Set metadata on LSP7
        lsp7.setData(_LSP4_METADATA_KEY, hex"11cc0000");

        // Verify proxied read works
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY),
            hex"11cc0000"
        );

        // Unlink by setting to empty bytes (address(0) as empty)
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            ""
        );
        vm.stopPrank();

        // After unlinking, reads should return local storage (empty)
        assertEq(lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY), "");
    }

    // --- Multiple Tracks with Different LSP7s ---

    function test_MultipleTracksWithDifferentLSP7s() public {
        // Mint tokenId2
        lsp8.mint(user1, tokenId2, true, "");

        // Create second LSP7 for tokenId2
        MockLSP7TrackToken lsp7b = new MockLSP7TrackToken(
            address(lsp8),
            tokenId2
        );

        // Link each tokenId to its LSP7 (both owned by user1)
        vm.startPrank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );
        lsp8.setDataForTokenId(
            tokenId2,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7b))
        );
        vm.stopPrank();

        // Set different metadata on each LSP7
        lsp7.setData(_LSP4_METADATA_KEY, hex"71ac0001");
        lsp7b.setData(_LSP4_METADATA_KEY, hex"71ac0002");

        // Verify each tokenId reads from its own LSP7
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY),
            hex"71ac0001"
        );
        assertEq(
            lsp8.getDataForTokenId(tokenId2, _LSP4_METADATA_KEY),
            hex"71ac0002"
        );

        // Batch read across both tokenIds
        bytes32[] memory tokenIds = new bytes32[](2);
        bytes32[] memory dataKeys = new bytes32[](2);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId2;
        dataKeys[0] = _LSP4_METADATA_KEY;
        dataKeys[1] = _LSP4_METADATA_KEY;

        bytes[] memory results = lsp8.getDataBatchForTokenIds(
            tokenIds,
            dataKeys
        );
        assertEq(results[0], hex"71ac0001");
        assertEq(results[1], hex"71ac0002");
    }

    // --- Link existing standalone LSP7 (track-first workflow) ---

    function test_LinkExistingStandaloneLSP7() public {
        // Mint a fresh tokenId the standalone track will later join.
        lsp8.mint(user1, tokenId2, true, "");

        // Simulate a standalone LSP7 deployed with no parent link.
        MockLSP7TrackToken standalone = new MockLSP7TrackToken(
            address(0),
            bytes32(0)
        );

        // Linking: artist updates the LSP7's reference contract to point to
        // the tokenId it is about to join. (In the real LSP7 extension this
        // is `setData(LSP8ReferenceContract, ...)` by the artist.)
        standalone.setReferenceContract(address(lsp8), tokenId2);

        // Then the artist calls setDataForTokenId on the LSP8 to complete
        // the link — bidirectional verification should now pass.
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId2,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(standalone))
        );

        // Verify the link is stored and data routing works.
        bytes memory stored = lsp8.getDataForTokenId(
            tokenId2,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY
        );
        assertEq(stored, abi.encodePacked(address(standalone)));

        standalone.setData(_LSP4_METADATA_KEY, hex"5ca1e000");
        assertEq(
            lsp8.getDataForTokenId(tokenId2, _LSP4_METADATA_KEY),
            hex"5ca1e000"
        );
    }

    // --- abi.encode (32-byte) address encoding ---

    function test_SetOwnableTrackTokenWithAbiEncode() public {
        // Use abi.encode (32-byte left-padded) instead of abi.encodePacked (20-byte)
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encode(address(lsp7))
        );

        // Set metadata on LSP7
        lsp7.setData(_LSP4_METADATA_KEY, hex"e0c32b17");

        // Read should still proxy correctly
        assertEq(
            lsp8.getDataForTokenId(tokenId1, _LSP4_METADATA_KEY),
            hex"e0c32b17"
        );
    }

    // --- Access Control After Transfer ---

    function test_NewOwnerCanSetDataAfterTransfer() public {
        address user2 = vm.addr(102);

        // user1 links LSP7
        vm.prank(user1);
        lsp8.setDataForTokenId(
            tokenId1,
            _LSP33_OWNABLE_TRACK_TOKEN_KEY,
            abi.encodePacked(address(lsp7))
        );

        // Transfer tokenId1 from user1 to user2
        vm.prank(user1);
        lsp8.transfer(user1, user2, tokenId1, true, "");

        // user1 can no longer set data
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP33NotTokenOwner.selector,
                user1,
                tokenId1,
                user2
            )
        );
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"01d00e30");

        // user2 CAN set data (forwards to LSP7)
        vm.prank(user2);
        lsp8.setDataForTokenId(tokenId1, _LSP4_METADATA_KEY, hex"1e770001");

        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"1e770001");
    }
}
