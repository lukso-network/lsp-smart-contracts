// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {
    LSP7MusicNFTAbstract
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTAbstract.sol";
import {
    LSP7DigitalAsset
} from "../contracts/LSP7DigitalAsset.sol";

// constants
import {
    _LSP34_OWNERSHIP_SOURCE_KEY,
    _LSP8_REFERENCE_CONTRACT_KEY
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY,
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

// errors
import {
    LSP34ExternalOwnershipActive,
    LSP7MusicNFTUnauthorized
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTErrors.sol";

// --- Mock LSP8 for testing ---

/// @dev Minimal mock of an LSP8 contract that supports tokenOwnerOf and transfer
contract MockLSP8 {
    mapping(bytes32 => address) private _tokenOwners;
    address public contractOwner;

    constructor() {
        contractOwner = msg.sender;
    }

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

    function transferTokenId(
        address to,
        bytes32 tokenId
    ) external {
        _tokenOwners[tokenId] = to;
    }
}

/// @dev Concrete implementation of LSP7MusicNFTAbstract for testing
contract MockLSP7MusicNFT is LSP7MusicNFTAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address lsp8Contract_,
        bytes32 tokenId_,
        bool isNonDivisible_
    )
        LSP7MusicNFTAbstract(
            name_,
            symbol_,
            lsp8Contract_,
            tokenId_,
            isNonDivisible_
        )
    {}
}

// --- Tests ---

contract LSP7MusicNFTTest is Test {
    MockLSP8 lsp8;
    MockLSP7MusicNFT lsp7;

    address deployer = address(this);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address unauthorized = vm.addr(103);

    bytes32 tokenId1 = bytes32(uint256(1));

    function setUp() public {
        // Deploy mock LSP8
        lsp8 = new MockLSP8();

        // Mint tokenId1 to user1
        lsp8.mint(user1, tokenId1);

        // Deploy LSP7 track token linked to LSP8 + tokenId1
        lsp7 = new MockLSP7MusicNFT(
            "Track Token",
            "TRACK",
            address(lsp8),
            tokenId1,
            true // non-divisible
        );
    }

    // --- LSP34 Owner Resolution ---

    function test_OwnerReturnsLSP8TokenOwner() public {
        assertEq(lsp7.owner(), user1);
    }

    function test_OwnerChangesWhenTokenTransferred() public {
        lsp8.transferTokenId(user2, tokenId1);
        assertEq(lsp7.owner(), user2);
    }

    function test_LSP34OwnershipSourceIsSet() public {
        bytes memory data = lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY);
        (address lsp8Addr, bytes32 tokenId) = abi.decode(
            data,
            (address, bytes32)
        );
        assertEq(lsp8Addr, address(lsp8));
        assertEq(tokenId, tokenId1);
    }

    function test_LSP8ReferenceContractIsSet() public {
        bytes memory data = lsp7.getData(_LSP8_REFERENCE_CONTRACT_KEY);
        (address lsp8Addr, bytes32 tokenId) = abi.decode(
            data,
            (address, bytes32)
        );
        assertEq(lsp8Addr, address(lsp8));
        assertEq(tokenId, tokenId1);
    }

    // --- transferOwnership / renounceOwnership Revert ---

    function test_TransferOwnershipRevertsWithLSP34() public {
        vm.prank(user1);
        vm.expectRevert(LSP34ExternalOwnershipActive.selector);
        lsp7.transferOwnership(user2);
    }

    function test_RenounceOwnershipRevertsWithLSP34() public {
        vm.prank(user1);
        vm.expectRevert(LSP34ExternalOwnershipActive.selector);
        lsp7.renounceOwnership();
    }

    // --- Parent Collection Authorization ---

    function test_OwnerCanSetData() public {
        vm.prank(user1);
        lsp7.setData(_LSP4_METADATA_KEY, hex"0001020304");

        bytes memory result = lsp7.getData(_LSP4_METADATA_KEY);
        assertEq(result, hex"0001020304");
    }

    function test_ParentLSP8CanSetData() public {
        vm.prank(address(lsp8));
        lsp7.setData(_LSP4_METADATA_KEY, hex"0a0b0c0d0e");

        bytes memory result = lsp7.getData(_LSP4_METADATA_KEY);
        assertEq(result, hex"0a0b0c0d0e");
    }

    function test_UnauthorizedCannotSetData() public {
        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7MusicNFTUnauthorized.selector,
                unauthorized
            )
        );
        lsp7.setData(_LSP4_METADATA_KEY, hex"badd0000");
    }

    function test_ParentLSP8CanSetDataBatch() public {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);
        keys[0] = _LSP4_METADATA_KEY;
        values[0] = hex"ba7c0000";

        vm.prank(address(lsp8));
        lsp7.setDataBatch(keys, values);

        bytes memory result = lsp7.getData(_LSP4_METADATA_KEY);
        assertEq(result, hex"ba7c0000");
    }

    function test_UnauthorizedCannotSetDataBatch() public {
        bytes32[] memory keys = new bytes32[](1);
        bytes[] memory values = new bytes[](1);
        keys[0] = _LSP4_METADATA_KEY;
        values[0] = hex"badd0000";

        vm.prank(unauthorized);
        vm.expectRevert(
            abi.encodeWithSelector(
                LSP7MusicNFTUnauthorized.selector,
                unauthorized
            )
        );
        lsp7.setDataBatch(keys, values);
    }

    // --- Minting ---

    function test_OwnerCanMint() public {
        vm.prank(user1);
        lsp7.mint(user1, 100, true, "");
        assertEq(lsp7.balanceOf(user1), 100);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(unauthorized);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.mint(unauthorized, 100, true, "");
    }

    function test_MintFollowsOwnershipChange() public {
        // Transfer token to user2
        lsp8.transferTokenId(user2, tokenId1);

        // user1 can no longer mint
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.mint(user1, 100, true, "");

        // user2 can mint
        vm.prank(user2);
        lsp7.mint(user2, 50, true, "");
        assertEq(lsp7.balanceOf(user2), 50);
    }
}
