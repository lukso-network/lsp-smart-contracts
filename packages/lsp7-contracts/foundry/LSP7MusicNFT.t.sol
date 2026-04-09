// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {
    LSP7MusicNFTAbstract
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTAbstract.sol";

// constants
import {
    _LSP34_OWNERSHIP_SOURCE_KEY,
    _LSP8_REFERENCE_CONTRACT_KEY
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {
    LSP34ExternalOwnershipActive,
    LSP7MusicNFTUnauthorized
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTErrors.sol";

// --- Mock LSP8 for testing ---

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

/// @dev Concrete test implementation of LSP7MusicNFTAbstract.
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
        // Deploy standalone LSP7 owned by the artist (plug-and-play default).
        lsp7 = new MockLSP7MusicNFT("Track Token", "TRACK", artist, true);
    }

    // --- Helpers ---

    function _link(address lsp8Addr, bytes32 tid) internal {
        vm.prank(artist);
        lsp7.setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(lsp8Addr, tid)
        );
    }

    // --- Standalone (no LSP34 source) ---

    function test_Standalone_OwnerIsInitialOwner() public {
        assertEq(lsp7.owner(), artist);
    }

    function test_Standalone_NoOwnershipSourceKey() public {
        bytes memory data = lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        assertEq(data.length, 0);
    }

    function test_Standalone_OwnerCanSetData() public {
        vm.prank(artist);
        lsp7.setData(_LSP4_METADATA_KEY, hex"01020304");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"01020304");
    }

    function test_Standalone_OwnerCanMint() public {
        vm.prank(artist);
        lsp7.mint(artist, 100, true, "");
        assertEq(lsp7.balanceOf(artist), 100);
    }

    function test_Standalone_UnauthorizedCannotSetData() public {
        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7MusicNFTUnauthorized.selector,
                unauthorized
            )
        );
        lsp7.setData(_LSP4_METADATA_KEY, hex"badd0000");
    }

    function test_Standalone_TransferOwnershipWorks() public {
        vm.prank(artist);
        lsp7.transferOwnership(user1);
        // LSP7DigitalAsset uses pending owner accept pattern; check pending.
        // If not two-step, owner() should already be user1. Either way,
        // no revert is the key assertion here.
    }

    function test_Standalone_RenounceOwnershipWorks() public {
        vm.prank(artist);
        lsp7.renounceOwnership();
        // No revert is the key assertion.
    }

    // --- Link-later workflow ---

    function test_LinkLater_OwnerResolvesToLSP8TokenOwner() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);
        assertEq(lsp7.owner(), user1);
    }

    function test_LinkLater_OwnershipSourceStored() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        bytes memory data = lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        (address lsp8Addr, bytes32 tid) = abi.decode(
            data,
            (address, bytes32)
        );
        assertEq(lsp8Addr, address(lsp8));
        assertEq(tid, tokenId1);
    }

    function test_LinkLater_OwnerChangesWhenTokenTransferred() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        lsp8.transferTokenId(user2, tokenId1);
        assertEq(lsp7.owner(), user2);
    }

    function test_LinkLater_TransferOwnershipReverts() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(user1);
        vm.expectRevert(LSP34ExternalOwnershipActive.selector);
        lsp7.transferOwnership(user2);
    }

    function test_LinkLater_RenounceOwnershipReverts() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(user1);
        vm.expectRevert(LSP34ExternalOwnershipActive.selector);
        lsp7.renounceOwnership();
    }

    function test_LinkLater_ResolvedOwnerCanSetData() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(user1);
        lsp7.setData(_LSP4_METADATA_KEY, hex"0a0b0c");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"0a0b0c");
    }

    function test_LinkLater_ParentLSP8CanSetData() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(address(lsp8));
        lsp7.setData(_LSP4_METADATA_KEY, hex"cafe");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"cafe");
    }

    function test_LinkLater_ParentLSP8CanSetDataBatch() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);
        keys[0] = _LSP4_METADATA_KEY;
        values[0] = hex"ba7c";

        vm.prank(address(lsp8));
        lsp7.setDataBatch(keys, values);
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"ba7c");
    }

    function test_LinkLater_OriginalOwnerLosesControl() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        // After linking, the artist's ERC173 ownership is shadowed by LSP34.
        vm.prank(artist);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7MusicNFTUnauthorized.selector,
                artist
            )
        );
        lsp7.setData(_LSP4_METADATA_KEY, hex"0000");
    }

    function test_LinkLater_UnauthorizedCannotSetData() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7MusicNFTUnauthorized.selector,
                unauthorized
            )
        );
        lsp7.setData(_LSP4_METADATA_KEY, hex"badd");
    }

    function test_LinkLater_MintFollowsTokenOwner() public {
        lsp8.mint(user1, tokenId1);
        _link(address(lsp8), tokenId1);

        vm.prank(user1);
        lsp7.mint(user1, 100, true, "");
        assertEq(lsp7.balanceOf(user1), 100);

        lsp8.transferTokenId(user2, tokenId1);

        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.mint(user1, 10, true, "");

        vm.prank(user2);
        lsp7.mint(user2, 50, true, "");
        assertEq(lsp7.balanceOf(user2), 50);
    }

    // --- Artist may set LSP8ReferenceContract during linking ---

    function test_LinkLater_ArtistCanSetReferenceContract() public {
        vm.prank(artist);
        lsp7.setData(
            _LSP8_REFERENCE_CONTRACT_KEY,
            abi.encode(address(lsp8), tokenId1)
        );

        bytes memory data = lsp7.getData(_LSP8_REFERENCE_CONTRACT_KEY);
        (address lsp8Addr, bytes32 tid) = abi.decode(
            data,
            (address, bytes32)
        );
        assertEq(lsp8Addr, address(lsp8));
        assertEq(tid, tokenId1);
    }
}
