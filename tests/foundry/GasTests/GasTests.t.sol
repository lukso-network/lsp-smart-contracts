// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "./LSP6MockGasTests.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
import "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../../../contracts/Mocks/Tokens/LSP7Tester.sol";
import "../../../contracts/Mocks/Tokens/LSP8Tester.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    _PERMISSION_SUPER_SETDATA,
    _PERMISSION_SUPER_CALL,
    _PERMISSION_REENTRANCY,
    _PERMISSION_SUPER_TRANSFERVALUE
} from "../../../contracts/LSP6KeyManager/LSP6Constants.sol";

contract GasTests is Test {
    LSP0ERC725Account public mainUniversalProfile;
    LSP0ERC725Account public randomUniversalProfile;
    LSP1UniversalReceiverDelegateUP public universalReceiverDelegate;
    LSP6MockGasTests public keyManagerMainUP;
    LSP6MockGasTests public keyManagerRandomUP;
    LSP7Tester public digitalAsset;
    LSP8Tester public indentifiableDigitalAsset;

    address public mainUniversalProfileOwner;
    address public randomUniversalProfileOwner;
    address public randomEOA;
    address public digitalAssetsOwner;

    function setUp() public {
        mainUniversalProfileOwner = vm.addr(1);
        vm.label(mainUniversalProfileOwner, "mainUniversalProfileOwner address");
        randomEOA = vm.addr(2);
        vm.label(randomEOA, "randomEOA address");
        digitalAssetsOwner = vm.addr(3);
        vm.label(digitalAssetsOwner, "digitalAssetsOwner address");
        randomUniversalProfileOwner = vm.addr(4);

        mainUniversalProfile = new LSP0ERC725Account(mainUniversalProfileOwner);
        randomUniversalProfile = new LSP0ERC725Account(randomUniversalProfileOwner);

        universalReceiverDelegate = new LSP1UniversalReceiverDelegateUP();

        // deploy LSP6KeyManagers
        keyManagerMainUP = new LSP6MockGasTests(address(mainUniversalProfile));
        keyManagerRandomUP = new LSP6MockGasTests(address(randomUniversalProfile));

        _setURDToUPAndGivePermissions(mainUniversalProfile, mainUniversalProfileOwner);
        _setURDToUPAndGivePermissions(randomUniversalProfile, randomUniversalProfileOwner);

        _giveSuperPermissionsToOwner(mainUniversalProfile, mainUniversalProfileOwner);
        _giveSuperPermissionsToOwner(randomUniversalProfile, randomUniversalProfileOwner);

        _transferOwnershipToKeyManager(
            mainUniversalProfile,
            address(keyManagerMainUP),
            mainUniversalProfileOwner
        );
        _transferOwnershipToKeyManager(
            randomUniversalProfile,
            address(keyManagerRandomUP),
            randomUniversalProfileOwner
        );
    }

    function testTransferLYXToEOA() public {
        // give some LYX to UniversalProfile
        vm.deal(address(mainUniversalProfile), 100 ether);
        assertEq((address(mainUniversalProfile)).balance, 100 ether);

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            randomEOA,
            10 ether,
            "0x"
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferLYXToEOA(transferPayload);

        assertEq((address(mainUniversalProfile)).balance, 90 ether);
        assertEq((address(randomEOA)).balance, 10 ether);
    }

    function testTransferLYXToRandomUP() public {
        // give some LYX to UniversalProfile
        vm.deal(address(mainUniversalProfile), 100 ether);
        assertEq((address(mainUniversalProfile)).balance, 100 ether);

        // transfer payload to random UP
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(randomUniversalProfile),
            10 ether,
            "0x"
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferLYXToUP(transferPayload);

        assertEq((address(mainUniversalProfile)).balance, 90 ether);
        assertEq((address(randomUniversalProfile)).balance, 10 ether);
    }

    function testTransferTokensToRandomUP() public {
        _deployandMintLSP7DigitalAsset();

        // transfer payload to random UP
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(digitalAsset),
            0,
            abi.encodeWithSignature(
                "transfer(address,address,uint256,bool,bytes)",
                address(mainUniversalProfile),
                address(randomUniversalProfile),
                10,
                false,
                "0x"
            )
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferTokensToRandomUP(transferPayload);

        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 90);
        assertEq(digitalAsset.balanceOf(address(randomUniversalProfile)), 10);
    }

    function testTransferTokensToRandomEOA() public {
        _deployandMintLSP7DigitalAsset();

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(digitalAsset),
            0,
            abi.encodeWithSignature(
                "transfer(address,address,uint256,bool,bytes)",
                address(mainUniversalProfile),
                randomEOA,
                10,
                true,
                "0x"
            )
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferTokensToRandomEOA(transferPayload);

        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 90);
        assertEq(digitalAsset.balanceOf(address(randomEOA)), 10);
    }

    function testTransferNFTToRandomUP() public {
        _deployAndMintNFT();

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(indentifiableDigitalAsset),
            0,
            abi.encodeWithSignature(
                "transfer(address,address,bytes32,bool,bytes)",
                address(mainUniversalProfile),
                randomUniversalProfile,
                bytes32(uint256(1)),
                false,
                "0x"
            )
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferNFTToRandomUP(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)), 0);

        // check if random EOA is owner of tokenID 1
        assertEq(
            indentifiableDigitalAsset.tokenOwnerOf(bytes32(uint256(1))),
            address(randomUniversalProfile)
        );
    }

    function testTransferNFTToRandomEOA() public {
        _deployAndMintNFT();

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(indentifiableDigitalAsset),
            0,
            abi.encodeWithSignature(
                "transfer(address,address,bytes32,bool,bytes)",
                address(mainUniversalProfile),
                randomEOA,
                bytes32(uint256(1)),
                true,
                "0x"
            )
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferNFTToRandomEOA(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)), 0);

        // check if random EOA is owner of tokenID 1
        assertEq(indentifiableDigitalAsset.tokenOwnerOf(bytes32(uint256(1))), address(randomEOA));
    }

    function _deployAndMintNFT() internal {
        indentifiableDigitalAsset = new LSP8Tester("TestLSP8", "TSTLSP8", digitalAssetsOwner);

        bytes32 tokenID = bytes32(uint256(1));

        // mint 100 tokens to UniversalProfile
        vm.prank(address(mainUniversalProfile));
        indentifiableDigitalAsset.mint(address(mainUniversalProfile), tokenID, false, "0x");

        // check if UniversalProfile has 100 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)), 1);
    }

    function _deployandMintLSP7DigitalAsset() internal {
        digitalAsset = new LSP7Tester("TestLSP7", "TSTLSP7", digitalAssetsOwner);

        // mint 100 tokens to UniversalProfile
        vm.prank(address(mainUniversalProfile));
        digitalAsset.mint(address(mainUniversalProfile), 100, false, "0x");

        // check if UniversalProfile has 100 tokens
        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 100);
    }

    function _setURDToUPAndGivePermissions(
        LSP0ERC725Account universalProfile,
        address universalProfileOwner
    ) internal {
        vm.startPrank(universalProfileOwner);
        universalProfile.setData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY,
            abi.encodePacked(universalReceiverDelegate)
        );

        // give SUPER_SETDATA permission to universalReceiverDelegate
        bytes32 dataKeyURD = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(abi.encodePacked(universalReceiverDelegate))
        );

        bytes32[] memory permissions = new bytes32[](2);

        permissions[0] = _PERMISSION_REENTRANCY;
        permissions[1] = _PERMISSION_SUPER_SETDATA;

        universalProfile.setData(dataKeyURD, abi.encodePacked(_combinePermissions(permissions)));
        vm.stopPrank();
    }

    function _giveSuperPermissionsToOwner(LSP0ERC725Account universalProfile, address owner)
        internal
    {
        bytes32 dataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(owner)
        );

        bytes32[] memory permissions = new bytes32[](3);
        permissions[0] = _PERMISSION_SUPER_CALL;
        permissions[1] = _PERMISSION_SUPER_TRANSFERVALUE;

        bytes32 combinedPermissions = _combinePermissions(permissions);
        bytes memory dataValue = abi.encodePacked(combinedPermissions);
        vm.prank(owner);
        universalProfile.setData(dataKey, dataValue);
    }

    function _transferOwnershipToKeyManager(
        LSP0ERC725Account universalProfile,
        address keyManager,
        address owner
    ) internal {
        // transfer ownership to keyManager
        vm.prank(owner);
        universalProfile.transferOwnership(keyManager);

        // accept ownership of UniversalProfile as keyManager
        vm.prank(keyManager);
        universalProfile.acceptOwnership();

        // check if keyManager is owner of UniversalProfile
        assertEq(universalProfile.owner(), address(keyManager));
    }

    function _combinePermissions(bytes32[] memory _permissions) internal pure returns (bytes32) {
        uint256 result = 0;
        for (uint256 i = 0; i < _permissions.length; i++) {
            result += uint256(_permissions[i]);
        }
        return bytes32(result);
    }
}
