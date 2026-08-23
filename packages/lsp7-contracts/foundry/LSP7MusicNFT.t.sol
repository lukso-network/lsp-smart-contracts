// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {
    LSP7MusicNFTAbstract
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTAbstract.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP33_METADATA_KEY,
    _LSP34_OWNERSHIP_SOURCE_KEY
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {
    LSP34NotAuthorizedToMint
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTErrors.sol";

// --- Mock LSP8 for LSP34 source resolution ---

contract MockLSP8 {
    mapping(bytes32 => address) private _tokenOwners;

    function mint(address to, bytes32 tokenId) external {
        _tokenOwners[tokenId] = to;
    }

    function tokenOwnerOf(
        bytes32 tokenId
    ) external view returns (address) {
        address tokenOwner = _tokenOwners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function transferTokenId(address to, bytes32 tokenId) external {
        _tokenOwners[tokenId] = to;
    }
}

/// @dev Minimal ERC173-owned contract used as an LSP34 source when
/// `tokenId == bytes32(0)`.
contract MockOwnedContract {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function transferOwnership(address newOwner) external {
        owner = newOwner;
    }
}

/// @dev Concrete test implementation of `LSP7MusicNFTAbstract`.
contract MockLSP7MusicNFT is LSP7MusicNFTAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        bool isNonDivisible_
    )
        LSP7MusicNFTAbstract(
            name_,
            symbol_,
            initialOwner_,
            isNonDivisible_
        )
    {}
}

// --- Tests ---

contract LSP7MusicNFTTest is Test {
    MockLSP8 lsp8;
    MockLSP7MusicNFT lsp7;

    address artist = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address unauthorized = vm.addr(103);

    bytes32 tokenId1 = bytes32(uint256(1));

    function setUp() public {
        lsp8 = new MockLSP8();
        lsp7 = new MockLSP7MusicNFT("Track Token", "TRACK", artist, true);
    }

    function _setSource(address srcContract, bytes32 tokenId) internal {
        vm.prank(artist);
        lsp7.setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(srcContract, tokenId)
        );
    }

    // --- LSP33 SupportedStandards marker ---

    function test_LSP33SupportedStandardsMarker() public {
        assertEq(
            lsp7.getData(_LSP33_SUPPORTED_STANDARDS_KEY),
            _LSP33_SUPPORTED_STANDARDS_VALUE
        );
    }

    // --- ERC173 ownership semantics (LSP34 leaves these untouched) ---

    function test_OwnerIsArtist() public {
        assertEq(lsp7.owner(), artist);
    }

    function test_OwnerUnchangedWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        // LSP34 MUST NOT affect owner(); it only delegates minting rights.
        assertEq(lsp7.owner(), artist);
    }

    function test_TransferOwnershipWorksWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(artist);
        lsp7.transferOwnership(user2);
        // LSP7 uses a direct transfer; owner updates immediately.
        assertEq(lsp7.owner(), user2);
    }

    function test_RenounceOwnershipWorksWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(artist);
        lsp7.renounceOwnership();
        assertEq(lsp7.owner(), address(0));
    }

    // --- setData is restricted to owner() even when LSP34 source is set ---

    function test_OwnerCanSetData() public {
        vm.prank(artist);
        lsp7.setData(_LSP4_METADATA_KEY, hex"01020304");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"01020304");
    }

    function test_OwnerCanSetLSP33Metadata() public {
        vm.prank(artist);
        lsp7.setData(_LSP33_METADATA_KEY, hex"cafebabe");
        assertEq(lsp7.getData(_LSP33_METADATA_KEY), hex"cafebabe");
    }

    function test_NonOwnerCannotSetDataWhenSourceUnset() public {
        vm.prank(unauthorized);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setData(_LSP4_METADATA_KEY, hex"badd0000");
    }

    function test_NonOwnerCannotSetDataWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        // user1 controls the LSP8 tokenId (the delegated minter) but LSP34
        // does NOT grant them setData rights.
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setData(_LSP4_METADATA_KEY, hex"0a0b0c");
    }

    // --- Mint permissions (LSP34 resolution) ---

    function test_OwnerCanMintWhenSourceUnset() public {
        vm.prank(artist);
        lsp7.mint(artist, 100, true, "");
        assertEq(lsp7.balanceOf(artist), 100);
    }

    function test_NonOwnerCannotMintWhenSourceUnset() public {
        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP34NotAuthorizedToMint.selector,
                unauthorized
            )
        );
        lsp7.mint(unauthorized, 1, true, "");
    }

    function test_OwnerCanStillMintWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(artist);
        lsp7.mint(artist, 10, true, "");
        assertEq(lsp7.balanceOf(artist), 10);
    }

    function test_TokenIdOwnerCanMint() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(user1);
        lsp7.mint(user1, 100, true, "");
        assertEq(lsp7.balanceOf(user1), 100);
    }

    function test_MintRightsFollowTokenIdOwnership() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(user1);
        lsp7.mint(user1, 50, true, "");

        lsp8.transferTokenId(user2, tokenId1);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP34NotAuthorizedToMint.selector,
                user1
            )
        );
        lsp7.mint(user1, 10, true, "");

        vm.prank(user2);
        lsp7.mint(user2, 25, true, "");
        assertEq(lsp7.balanceOf(user2), 25);
    }

    function test_UnauthorizedCannotMintWhenSourceSet() public {
        lsp8.mint(user1, tokenId1);
        _setSource(address(lsp8), tokenId1);

        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP34NotAuthorizedToMint.selector,
                unauthorized
            )
        );
        lsp7.mint(unauthorized, 1, true, "");
    }

    // --- LSP34 source with bytes32(0) tokenId resolves via IERC173.owner() ---

    function test_MintRightsFromOwnedContract() public {
        MockOwnedContract src = new MockOwnedContract(user1);
        _setSource(address(src), bytes32(0));

        vm.prank(user1);
        lsp7.mint(user1, 7, true, "");
        assertEq(lsp7.balanceOf(user1), 7);

        // Transfer the source contract ownership; mint rights follow.
        src.transferOwnership(user2);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP34NotAuthorizedToMint.selector,
                user1
            )
        );
        lsp7.mint(user1, 1, true, "");

        vm.prank(user2);
        lsp7.mint(user2, 3, true, "");
        assertEq(lsp7.balanceOf(user2), 3);
    }

    // --- Malformed `LSP34OwnershipSource` value is ignored ---

    function test_MalformedSourceTreatedAsUnset() public {
        // 20 bytes is the wrong encoding (LSP34 requires abi.encode(address, bytes32) = 64 bytes).
        vm.prank(artist);
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, abi.encodePacked(user1));

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP34NotAuthorizedToMint.selector,
                user1
            )
        );
        lsp7.mint(user1, 1, true, "");

        // Owner can still mint.
        vm.prank(artist);
        lsp7.mint(artist, 1, true, "");
        assertEq(lsp7.balanceOf(artist), 1);
    }
}
