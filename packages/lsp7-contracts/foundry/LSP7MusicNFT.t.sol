// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "forge-std/Test.sol";

// modules
import {LSP7MusicNFTAbstract} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTAbstract.sol";
import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import {LSP8Burnable} from "@lukso/lsp8-contracts/contracts/extensions/LSP8Burnable/LSP8Burnable.sol";
import {LSP8MusicNFTAbstract} from "@lukso/lsp8-contracts/contracts/extensions/LSP8MusicNFT/LSP8MusicNFTAbstract.sol";

// interfaces
import {IERC725Y} from "@erc725/smart-contracts-v8/contracts/interfaces/IERC725Y.sol";

// constants
import {
    _LSP33_SUPPORTED_STANDARDS_KEY,
    _LSP33_SUPPORTED_STANDARDS_VALUE,
    _LSP33_METADATA_KEY,
    _LSP34_OWNERSHIP_SOURCE_KEY
} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTConstants.sol";
import {
    _LSP4_METADATA_KEY,
    _LSP4_TOKEN_NAME_KEY,
    _LSP4_TOKEN_TYPE_COLLECTION
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";

// errors
import {LSP34NotAuthorizedToMint} from "../contracts/extensions/LSP7MusicNFT/LSP7MusicNFTErrors.sol";
import {LSP4TokenNameNotEditable} from "@lukso/lsp4-contracts/contracts/LSP4Errors.sol";
import {LSP8NonExistentTokenId} from "@lukso/lsp8-contracts/contracts/LSP8Errors.sol";

// --- Mock LSP8 for LSP34 source resolution ---

contract MockLSP8 {
    mapping(bytes32 => address) private _tokenOwners;

    function mint(address to, bytes32 tokenId) external {
        _tokenOwners[tokenId] = to;
    }

    function tokenOwnerOf(bytes32 tokenId) external view returns (address) {
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

/// @dev LSP33 release built from the product LSP8 contracts (music marker,
/// standard LSP8 and `LSP8Burnable`). Used as a real LSP34 source: the holder
/// of a release tokenId can mint the matching LSP7 track.
contract MockLSP8MusicRelease is LSP8MusicNFTAbstract, LSP8Burnable {
    constructor(
        address newOwner_
    )
        LSP8IdentifiableDigitalAsset(
            "Music Release",
            "RELEASE",
            newOwner_,
            _LSP4_TOKEN_TYPE_COLLECTION,
            _LSP8_TOKENID_FORMAT_NUMBER
        )
        LSP8MusicNFTAbstract()
    {}

    function mint(address to, bytes32 tokenId) public onlyOwner {
        _mint(to, tokenId, true, "");
    }
}

/// @dev Adversarial LSP34 source. Both resolution calls (`tokenOwnerOf` and
/// `owner()`) misbehave in the way chosen at deployment.
contract MisbehavingSource {
    enum Behaviour {
        Revert,
        ConsumeAllGas,
        ReturnDirtyAddress,
        WriteState
    }

    error SourceUnavailable();

    Behaviour public immutable behaviour;
    address public immutable holder;
    uint256 public resolutions;

    constructor(Behaviour behaviour_, address holder_) {
        behaviour = behaviour_;
        holder = holder_;
    }

    function tokenOwnerOf(bytes32) external returns (address) {
        return _resolve();
    }

    function owner() external returns (address) {
        return _resolve();
    }

    function _resolve() internal returns (address) {
        if (behaviour == Behaviour.Revert) revert SourceUnavailable();

        if (behaviour == Behaviour.ConsumeAllGas) {
            assembly {
                invalid()
            }
        }

        if (behaviour == Behaviour.ReturnDirtyAddress) {
            // `holder` with a bit set above the 160 address bits.
            uint256 dirty = (uint256(1) << 160) | uint256(uint160(holder));
            assembly {
                mstore(0, dirty)
                return(0, 32)
            }
        }

        // `WriteState`: a storage write fails under STATICCALL.
        ++resolutions;
        return holder;
    }
}

/// @dev Concrete test implementation of `LSP7MusicNFTAbstract`.
contract MockLSP7MusicNFT is LSP7MusicNFTAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        bool isNonDivisible_
    ) LSP7MusicNFTAbstract(name_, symbol_, initialOwner_, isNonDivisible_) {}
}

// --- Tests ---

contract LSP7MusicNFTTest is Test {
    MockLSP8 lsp8;
    MockLSP7MusicNFT lsp7;
    MockLSP8MusicRelease release;

    address artist = vm.addr(100);
    address user1 = vm.addr(101);
    address user2 = vm.addr(102);
    address unauthorized = vm.addr(103);
    address label = vm.addr(104);
    address user3 = vm.addr(105);

    bytes32 tokenId1 = bytes32(uint256(1));
    bytes32 tokenId2 = bytes32(uint256(2));

    function setUp() public {
        lsp8 = new MockLSP8();
        lsp7 = new MockLSP7MusicNFT("Track Token", "TRACK", artist, true);
        // Real LSP8 release owned by a label, used as an LSP34 source.
        release = new MockLSP8MusicRelease(label);
    }

    function _setSource(address srcContract, bytes32 tokenId) internal {
        vm.prank(artist);
        lsp7.setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(srcContract, tokenId)
        );
    }

    function _setSourceOf(
        MockLSP7MusicNFT track,
        address srcContract,
        bytes32 tokenId
    ) internal {
        vm.prank(artist);
        track.setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(srcContract, tokenId)
        );
    }

    function _setRawSource(bytes memory value) internal {
        vm.prank(artist);
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, value);
    }

    function _notAuthorized(
        address caller
    ) internal pure returns (bytes memory) {
        return
            abi.encodeWithSelector(LSP34NotAuthorizedToMint.selector, caller);
    }

    function _nonExistent(
        bytes32 tokenId
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(LSP8NonExistentTokenId.selector, tokenId);
    }

    /// @dev `caller` mints one unit of `track` to itself.
    function _mintOne(MockLSP7MusicNFT track, address caller) internal {
        uint256 balanceBefore = track.balanceOf(caller);
        vm.prank(caller);
        track.mint(caller, 1, true, "");
        assertEq(track.balanceOf(caller), balanceBefore + 1);
    }

    /// @dev `caller` cannot mint `track`: the call reverts with exactly
    /// `expectedRevertData` and the supply is unchanged. The gas cap keeps
    /// sources that consume all gas cheap to test.
    function _assertCannotMint(
        MockLSP7MusicNFT track,
        address caller,
        bytes memory expectedRevertData
    ) internal {
        uint256 supplyBefore = track.totalSupply();
        vm.prank(caller);
        (bool success, bytes memory revertData) = address(track).call{
            gas: 1_000_000
        }(abi.encodeCall(track.mint, (caller, 1, true, "")));
        assertFalse(success);
        assertEq(revertData, expectedRevertData);
        assertEq(track.totalSupply(), supplyBefore);
    }

    /// @dev Like `_assertCannotMint`, for failures raised by Solidity's own
    /// checks, which revert without data (ABI decoding, a failed STATICCALL).
    /// At the `-vvvv` verbosity used by `npm run test:foundry`, Foundry's
    /// revert diagnostics replace empty revert data with an ABI-encoded
    /// "call to non-contract address ..." string once the test has called a
    /// codeless address (e.g. an LSP1 check on an EOA recipient). That form
    /// is accepted too; the contracts under test never produce it.
    function _assertCannotMintWithoutRevertData(
        MockLSP7MusicNFT track,
        address caller
    ) internal {
        uint256 supplyBefore = track.totalSupply();
        vm.prank(caller);
        (bool success, bytes memory revertData) = address(track).call{
            gas: 1_000_000
        }(abi.encodeCall(track.mint, (caller, 1, true, "")));
        assertFalse(success);
        assertTrue(
            revertData.length == 0 || _isFoundryRevertDiagnostic(revertData)
        );
        assertEq(track.totalSupply(), supplyBefore);
    }

    function _isFoundryRevertDiagnostic(
        bytes memory revertData
    ) internal pure returns (bool) {
        bytes memory marker = bytes("call to non-contract address ");
        for (uint256 i; i + marker.length <= revertData.length; ++i) {
            uint256 j;
            while (j < marker.length && revertData[i + j] == marker[j]) ++j;
            if (j == marker.length) return true;
        }
        return false;
    }

    /// @dev The owner mints and writes data (single and batch) while the
    /// configured source is broken. A source query would revert, so these
    /// calls only succeed because `mint` checks `owner()` first and
    /// `setData` / `setDataBatch` never query the source.
    function _assertOwnerUnaffected() internal {
        _mintOne(lsp7, artist);

        vm.prank(artist);
        lsp7.setData(_LSP4_METADATA_KEY, hex"cafe");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"cafe");

        bytes32[] memory keys = new bytes32[](2);
        keys[0] = _LSP4_METADATA_KEY;
        keys[1] = _LSP33_METADATA_KEY;
        bytes[] memory values = new bytes[](2);
        values[0] = hex"beef";
        values[1] = hex"f00d";
        vm.prank(artist);
        lsp7.setDataBatch(keys, values);
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"beef");
        assertEq(lsp7.getData(_LSP33_METADATA_KEY), hex"f00d");
    }

    // --- LSP33 SupportedStandards marker ---

    function test_LSP33SupportedStandardsMarker() public {
        assertEq(
            lsp7.getData(_LSP33_SUPPORTED_STANDARDS_KEY),
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

    function test_SingletonDataKeysAreLSP2Derived() public {
        assertEq(_LSP33_METADATA_KEY, keccak256("LSP33Metadata"));
        assertEq(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            keccak256("LSP34OwnershipSource")
        );
    }

    function test_LSP33MarkerWrittenUnderDerivedKeyOnly() public {
        assertEq(
            lsp7.getData(_derivedLSP33MarkerKey()),
            abi.encodePacked(bytes4(keccak256("LSP33MusicNFT")))
        );
        // New deployments must not write the legacy (mis-derived) draft key.
        assertEq(lsp7.getData(_legacyLSP33MarkerKey()).length, 0);
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
            abi.encodeWithSelector(LSP34NotAuthorizedToMint.selector, user1)
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
            abi.encodeWithSelector(LSP34NotAuthorizedToMint.selector, user1)
        );
        lsp7.mint(user1, 1, true, "");

        vm.prank(user2);
        lsp7.mint(user2, 3, true, "");
        assertEq(lsp7.balanceOf(user2), 3);
    }

    // --- Malformed `LSP34OwnershipSource` values never grant minting rights ---

    function test_MalformedSourceTreatedAsUnset() public {
        // 20 bytes is the wrong encoding (LSP34 requires abi.encode(address, bytes32) = 64 bytes).
        vm.prank(artist);
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, abi.encodePacked(user1));

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(LSP34NotAuthorizedToMint.selector, user1)
        );
        lsp7.mint(user1, 1, true, "");

        // Owner can still mint.
        vm.prank(artist);
        lsp7.mint(artist, 1, true, "");
        assertEq(lsp7.balanceOf(artist), 1);
    }

    function test_WrongLengthSourceValuesTreatedAsUnset() public {
        vm.prank(label);
        release.mint(user1, tokenId1);

        bytes[] memory values = new bytes[](5);
        values[0] = "";
        values[1] = abi.encode(address(release));
        values[2] = abi.encodePacked(
            bytes32(uint256(uint160(address(release)))),
            bytes31(tokenId1)
        );
        values[3] = abi.encodePacked(
            abi.encode(address(release), tokenId1),
            bytes1(0)
        );
        values[4] = abi.encode(address(release), tokenId1, uint256(0));

        for (uint256 i; i < values.length; ++i) {
            _setRawSource(values[i]);
            _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        }
        _mintOne(lsp7, artist);
    }

    function test_PackedTupleSourceValueTreatedAsUnset() public {
        // LSP2 encodes the `(address,bytes32)` valueType as an unpadded 52-byte
        // tuple, while LSP34 prescribes `abi.encode(address, bytes32)` (64
        // bytes). Only the LSP34 encoding is honoured.
        vm.prank(label);
        release.mint(user1, tokenId1);

        bytes memory packed = abi.encodePacked(address(release), tokenId1);
        assertEq(packed.length, 52);
        _setRawSource(packed);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));

        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);
    }

    function test_DirtyAddressBitsInSourceValueGrantNoRights() public {
        // 64 bytes, but the address word has a bit set above bit 159, so the
        // value is not a valid `abi.encode(address, bytes32)`. `abi.decode`
        // rejects it instead of truncating it to `release`: the holder of
        // tokenId1 cannot mint and the call reverts without data (it is not
        // treated as unset, which would revert with LSP34NotAuthorizedToMint).
        vm.prank(label);
        release.mint(user1, tokenId1);
        uint256 dirtyWord = (uint256(1) << 160) |
            uint256(uint160(address(release)));
        _setRawSource(abi.encode(dirtyWord, tokenId1));

        _assertCannotMintWithoutRevertData(lsp7, user1);
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);
        _assertOwnerUnaffected();
    }

    function testFuzz_DirtyAddressBitsInSourceValueGrantNoRights(
        uint96 dirt
    ) public {
        vm.assume(dirt != 0);
        vm.prank(label);
        release.mint(user1, tokenId1);
        uint256 dirtyWord = (uint256(dirt) << 160) |
            uint256(uint160(address(release)));
        _setRawSource(abi.encode(dirtyWord, tokenId1));

        _assertCannotMintWithoutRevertData(lsp7, user1);
        _mintOne(lsp7, artist);
    }

    // --- The owner never depends on the LSP34 source ---
    //
    // Each test below configures a broken source. The owner keeps minting and
    // writing data; every other caller fails with the source's own failure and
    // gains nothing.

    function test_OwnerUnaffectedWhenSourceReverts() public {
        MisbehavingSource src = new MisbehavingSource(
            MisbehavingSource.Behaviour.Revert,
            user1
        );
        bytes memory sourceError = abi.encodeWithSelector(
            MisbehavingSource.SourceUnavailable.selector
        );

        // tokenId mode (`tokenOwnerOf`), then owner() mode (`bytes32(0)`).
        _setSource(address(src), tokenId1);
        _assertOwnerUnaffected();
        _assertCannotMint(lsp7, user1, sourceError);
        _assertCannotMint(lsp7, unauthorized, sourceError);

        _setSource(address(src), bytes32(0));
        _assertOwnerUnaffected();
        _assertCannotMint(lsp7, user1, sourceError);
        _assertCannotMint(lsp7, unauthorized, sourceError);
    }

    function test_OwnerUnaffectedWhenSourceHasNoCode() public {
        address noCode = makeAddr("sourceWithoutCode");
        assertEq(noCode.code.length, 0);

        _setSource(noCode, tokenId1);
        _assertOwnerUnaffected();
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);

        _setSource(noCode, bytes32(0));
        _assertOwnerUnaffected();
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);
    }

    function test_OwnerUnaffectedWhenSourceConsumesAllGas() public {
        MisbehavingSource src = new MisbehavingSource(
            MisbehavingSource.Behaviour.ConsumeAllGas,
            user1
        );
        _setSource(address(src), tokenId1);

        _assertOwnerUnaffected();
        _assertCannotMintWithoutRevertData(lsp7, user1);
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);
    }

    function test_OwnerUnaffectedWhenSourceWritesState() public {
        MisbehavingSource src = new MisbehavingSource(
            MisbehavingSource.Behaviour.WriteState,
            user1
        );
        // Called directly (CALL), the source answers and records the query.
        assertEq(src.tokenOwnerOf(tokenId1), user1);
        assertEq(src.resolutions(), 1);

        _setSource(address(src), tokenId1);
        _assertOwnerUnaffected();

        // The track queries the source with STATICCALL, so the source cannot
        // change state while resolving: the write makes the query fail and
        // nobody is granted anything, not even the address it would return.
        _assertCannotMintWithoutRevertData(lsp7, user1);
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);
        assertEq(src.resolutions(), 1);
    }

    function test_OwnerUnaffectedWhenSourceReturnsDirtyAddress() public {
        MisbehavingSource src = new MisbehavingSource(
            MisbehavingSource.Behaviour.ReturnDirtyAddress,
            user1
        );
        _setSource(address(src), tokenId1);

        _assertOwnerUnaffected();
        // The returned word is not a valid ABI-encoded address. It is not
        // truncated to `user1`: decoding reverts and nobody can mint.
        _assertCannotMintWithoutRevertData(lsp7, user1);
        _assertCannotMintWithoutRevertData(lsp7, unauthorized);
    }

    function test_OwnerUnaffectedWhenSourceTokenIdDoesNotExist() public {
        _setSource(address(release), tokenId1);

        _assertOwnerUnaffected();
        // The LSP34 minter is `tokenOwnerOf(tokenId)`, which reverts for a
        // tokenId that was never minted; the source's error is bubbled up.
        _assertCannotMint(lsp7, user1, _nonExistent(tokenId1));
        _assertCannotMint(lsp7, label, _nonExistent(tokenId1));
        _assertCannotMint(lsp7, unauthorized, _nonExistent(tokenId1));

        // Resolution is live: once the tokenId exists, its holder can mint.
        vm.prank(label);
        release.mint(user1, tokenId1);
        _mintOne(lsp7, user1);
        _assertCannotMint(lsp7, unauthorized, _notAuthorized(unauthorized));
    }

    function test_BurningSourceTokenIdRevokesDelegatedMinting() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);

        // The holder burns the release tokenId (product `LSP8Burnable`).
        vm.prank(user1);
        release.burn(tokenId1, "");

        _assertCannotMint(lsp7, user1, _nonExistent(tokenId1));
        _assertCannotMint(lsp7, unauthorized, _nonExistent(tokenId1));
        _assertOwnerUnaffected();
    }

    function test_OwnerCanRepairBrokenSource() public {
        MisbehavingSource broken = new MisbehavingSource(
            MisbehavingSource.Behaviour.Revert,
            user1
        );
        _setSource(address(broken), tokenId1);

        // The owner re-points the source to a working one ...
        vm.prank(label);
        release.mint(user2, tokenId1);
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user2);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));

        // ... or clears it, which leaves minting to the owner only.
        _setRawSource("");
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));
        _mintOne(lsp7, artist);
    }

    function test_OwnershipTransferAndRenounceWorkWhenSourceReverts() public {
        MisbehavingSource src = new MisbehavingSource(
            MisbehavingSource.Behaviour.Revert,
            user1
        );
        _setSource(address(src), tokenId1);

        vm.prank(artist);
        lsp7.transferOwnership(user2);
        assertEq(lsp7.owner(), user2);

        // The new owner mints and writes data without the source.
        _mintOne(lsp7, user2);
        vm.prank(user2);
        lsp7.setData(_LSP4_METADATA_KEY, hex"0102");
        assertEq(lsp7.getData(_LSP4_METADATA_KEY), hex"0102");

        // The previous owner is now an ordinary caller: minting goes through
        // the broken source and `setData` is denied.
        _assertCannotMint(
            lsp7,
            artist,
            abi.encodeWithSelector(MisbehavingSource.SourceUnavailable.selector)
        );
        vm.prank(artist);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setData(_LSP4_METADATA_KEY, hex"00");

        vm.prank(user2);
        lsp7.renounceOwnership();
        assertEq(lsp7.owner(), address(0));
    }

    // --- Delegated minting against a real LSP8 release ---

    function test_DelegatedRightsFollowRealLSP8Transfers() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);

        vm.prank(user1);
        release.transfer(user1, user2, tokenId1, true, "");

        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _mintOne(lsp7, user2);
    }

    function test_LSP8OperatorOfSourceTokenIdCannotMint() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);

        // An operator may transfer the tokenId but is not its `tokenOwnerOf`.
        vm.prank(user1);
        release.authorizeOperator(user2, tokenId1, "");
        assertTrue(release.isOperatorFor(user2, tokenId1));

        _assertCannotMint(lsp7, user2, _notAuthorized(user2));
        _mintOne(lsp7, user1);
    }

    function test_ZeroTokenIdResolvesSourceOwnerNotTokenIdZeroHolder() public {
        // LSP34 reserves `bytes32(0)` as the "query owner()" sentinel, even on
        // an LSP8 where tokenId 0 exists.
        vm.prank(label);
        release.mint(user1, bytes32(0));
        _setSource(address(release), bytes32(0));

        _mintOne(lsp7, label);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
    }

    function test_ZeroResolvedMinterGrantsNothing() public {
        // An owned source that renounced ownership resolves to address(0).
        MockOwnedContract src = new MockOwnedContract(address(0));
        _setSource(address(src), bytes32(0));

        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _assertCannotMint(lsp7, unauthorized, _notAuthorized(unauthorized));
        _mintOne(lsp7, artist);
    }

    function test_TokenIdModeOnSourceWithoutTokenOwnerOfGrantsNothing() public {
        // A non-zero tokenId always selects `tokenOwnerOf`, which a plain
        // owned contract does not implement.
        MockOwnedContract src = new MockOwnedContract(user1);
        _setSource(address(src), tokenId1);

        _assertCannotMintWithoutRevertData(lsp7, user1);
        _mintOne(lsp7, artist);
    }

    function testFuzz_OnlyOwnerAndTokenIdHolderCanMint(address caller) public {
        vm.assume(caller != artist && caller != user1 && caller != address(vm));
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);

        _assertCannotMint(lsp7, caller, _notAuthorized(caller));
        _mintOne(lsp7, user1);
        _mintOne(lsp7, artist);
    }

    // --- Source lifecycle: set, clear, re-point ---

    function test_ClearingSourceRevokesDelegatedMinting() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);

        _setRawSource("");
        assertEq(lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY).length, 0);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _mintOne(lsp7, artist);

        // Setting the source again restores the delegation.
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);
    }

    function test_RepointingSourceTokenIdMovesMintRights() public {
        vm.startPrank(label);
        release.mint(user1, tokenId1);
        release.mint(user2, tokenId2);
        vm.stopPrank();

        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));

        _setSource(address(release), tokenId2);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _mintOne(lsp7, user2);
    }

    function test_RepointingSourceContractMovesMintRights() public {
        MockLSP8MusicRelease otherRelease = new MockLSP8MusicRelease(label);
        vm.startPrank(label);
        release.mint(user1, tokenId1);
        otherRelease.mint(user2, tokenId1);
        vm.stopPrank();

        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));

        // Same tokenId, different source contract.
        _setSource(address(otherRelease), tokenId1);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _mintOne(lsp7, user2);
    }

    function test_SwitchingSourceModeMovesMintRights() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        MockOwnedContract ownedSource = new MockOwnedContract(user2);

        // tokenId mode -> owner() mode on a plain owned contract.
        _setSource(address(release), tokenId1);
        _mintOne(lsp7, user1);
        _setSource(address(ownedSource), bytes32(0));
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _mintOne(lsp7, user2);

        // owner() mode on the release resolves to the release owner.
        _setSource(address(release), bytes32(0));
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));
        _mintOne(lsp7, label);

        // Back to tokenId mode.
        _setSource(address(release), tokenId1);
        _assertCannotMint(lsp7, label, _notAuthorized(label));
        _mintOne(lsp7, user1);
    }

    function test_IndependentTracksDoNotInterfere() public {
        MockLSP7MusicNFT track2 = new MockLSP7MusicNFT(
            "Track Token 2",
            "TRACK2",
            artist,
            true
        );
        vm.startPrank(label);
        release.mint(user1, tokenId1);
        release.mint(user2, tokenId2);
        vm.stopPrank();
        _setSourceOf(lsp7, address(release), tokenId1);
        _setSourceOf(track2, address(release), tokenId2);

        _mintOne(lsp7, user1);
        _mintOne(track2, user2);
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));
        _assertCannotMint(track2, user1, _notAuthorized(user1));

        // Moving tokenId1 only moves the rights on track 1.
        vm.prank(user1);
        release.transfer(user1, user3, tokenId1, true, "");
        _mintOne(lsp7, user3);
        _assertCannotMint(track2, user3, _notAuthorized(user3));
        _mintOne(track2, user2);

        // Clearing track 1's source leaves track 2 untouched.
        _setRawSource("");
        _assertCannotMint(lsp7, user3, _notAuthorized(user3));
        _mintOne(track2, user2);

        // Burning tokenId2 only affects track 2.
        _setSourceOf(lsp7, address(release), tokenId1);
        vm.prank(user2);
        release.burn(tokenId2, "");
        _assertCannotMint(track2, user2, _nonExistent(tokenId2));
        _mintOne(lsp7, user3);
    }

    function test_SameTokenIdOnDifferentReleasesDoNotInterfere() public {
        MockLSP8MusicRelease otherRelease = new MockLSP8MusicRelease(label);
        MockLSP7MusicNFT track2 = new MockLSP7MusicNFT(
            "Track Token 2",
            "TRACK2",
            artist,
            true
        );
        vm.startPrank(label);
        release.mint(user1, tokenId1);
        otherRelease.mint(user2, tokenId1);
        vm.stopPrank();
        _setSourceOf(lsp7, address(release), tokenId1);
        _setSourceOf(track2, address(otherRelease), tokenId1);

        _mintOne(lsp7, user1);
        _mintOne(track2, user2);
        _assertCannotMint(lsp7, user2, _notAuthorized(user2));
        _assertCannotMint(track2, user1, _notAuthorized(user1));
    }

    function test_DelegateCannotRewriteSource() public {
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);
        bytes memory configured = lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY);

        // The delegated minter tries to point the source at a contract it
        // owns (to keep minting after selling tokenId1), or to clear it.
        MockOwnedContract ownSource = new MockOwnedContract(user1);
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setData(
            _LSP34_OWNERSHIP_SOURCE_KEY,
            abi.encode(address(ownSource), bytes32(0))
        );

        bytes32[] memory keys = new bytes32[](1);
        keys[0] = _LSP34_OWNERSHIP_SOURCE_KEY;
        bytes[] memory values = new bytes[](1);
        values[0] = "";
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setDataBatch(keys, values);

        assertEq(lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY), configured);

        // After selling tokenId1 the former delegate has no rights left.
        vm.prank(user1);
        release.transfer(user1, user2, tokenId1, true, "");
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
    }

    function test_RevertedSourceBatchGrantsNothing() public {
        vm.prank(label);
        release.mint(user1, tokenId1);

        // The batch fails on its second entry (LSP4TokenName is not editable),
        // so the LSP34 source in the first entry is not stored either.
        bytes32[] memory keys = new bytes32[](2);
        keys[0] = _LSP34_OWNERSHIP_SOURCE_KEY;
        keys[1] = _LSP4_TOKEN_NAME_KEY;
        bytes[] memory values = new bytes[](2);
        values[0] = abi.encode(address(release), tokenId1);
        values[1] = bytes("Renamed");
        vm.prank(artist);
        vm.expectRevert(LSP4TokenNameNotEditable.selector);
        lsp7.setDataBatch(keys, values);

        assertEq(lsp7.getData(_LSP34_OWNERSHIP_SOURCE_KEY).length, 0);
        _assertCannotMint(lsp7, user1, _notAuthorized(user1));
    }

    function test_RenounceOwnershipFreezesDelegation() public {
        // Standard ERC173 + LSP34: once ownership is renounced nobody can
        // change or clear the source, so an active delegation stays in place.
        vm.prank(label);
        release.mint(user1, tokenId1);
        _setSource(address(release), tokenId1);

        vm.prank(artist);
        lsp7.renounceOwnership();

        vm.prank(artist);
        vm.expectRevert("Ownable: caller is not the owner");
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, "");

        _mintOne(lsp7, user1);
        _assertCannotMint(lsp7, artist, _notAuthorized(artist));

        // Mint rights keep following the tokenId.
        vm.prank(user1);
        release.transfer(user1, user2, tokenId1, true, "");
        _mintOne(lsp7, user2);
    }

    // --- ERC725Y DataChanged events ---

    function test_SourceChangesEmitDataChanged() public {
        bytes memory value = abi.encode(address(release), tokenId1);

        vm.prank(artist);
        vm.expectEmit(true, true, true, true, address(lsp7));
        emit IERC725Y.DataChanged(_LSP34_OWNERSHIP_SOURCE_KEY, value);
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, value);

        vm.prank(artist);
        vm.expectEmit(true, true, true, true, address(lsp7));
        emit IERC725Y.DataChanged(_LSP34_OWNERSHIP_SOURCE_KEY, "");
        lsp7.setData(_LSP34_OWNERSHIP_SOURCE_KEY, "");
    }

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
        MockLSP7MusicNFT deployed = new MockLSP7MusicNFT(
            "Track Token",
            "TRACK",
            artist,
            true
        );

        assertEq(address(deployed), predicted);
    }
}
