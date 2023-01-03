// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "./LSP6MockGasTests.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
import "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../../../contracts/Mocks/Tokens/LSP7Tester.sol";
import "../../../contracts/Mocks/Tokens/LSP8Tester.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";

contract GasTests is Test {
    LSP0ERC725Account public universalProfile;
    LSP0ERC725Account public randomUniversalProfile;
    LSP1UniversalReceiverDelegateUP public universalReceiverDelegate;
    LSP6MockGasTests public keyManager;
    LSP7Tester public digitalAsset;
    LSP8Tester public indentifiableDigitalAsset;

    address public universalProfileOwner;
    address public randomEOA;
    address public digitalAssetsOwner;

    function setUp() public {
        universalProfileOwner = vm.addr(1);
        randomEOA = vm.addr(2);
        digitalAssetsOwner = vm.addr(3);

        universalProfile = new LSP0ERC725Account(universalProfileOwner);
        // create random UP
        randomUniversalProfile = new LSP0ERC725Account(vm.addr(4));

        // create LSP1UniversalReceiverDelegateUP
        universalReceiverDelegate = new LSP1UniversalReceiverDelegateUP();

        // set LSP1UniversalReceiverDelegateUP as delegate for UniversalProfile
        vm.prank(universalProfileOwner);
        universalProfile.setData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY,
            abi.encode(address(universalReceiverDelegate))
        );

        keyManager = new LSP6MockGasTests(address(universalProfile));

        // give all permissions to universalProfileOwner
        bytes32 dataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(universalProfileOwner)
        );
        bytes memory dataValue = bytes(abi.encode((type(uint256).max)));
        vm.prank(universalProfileOwner);
        universalProfile.setData(dataKey, dataValue);

        // check if universalProfileOwner has all permissions
        assertEq(universalProfile.getData(dataKey), dataValue);

        // transfer ownership to keyManager
        vm.prank(universalProfileOwner);
        universalProfile.transferOwnership(address(keyManager));

        // accept ownership of UniversalProfile as keyManager
        vm.prank(address(keyManager));
        universalProfile.acceptOwnership();

        // check if keyManager is owner of UniversalProfile
        assertEq(universalProfile.owner(), address(keyManager));
    }

    function testTransferLYXToEOA() public {
        // give some LYX to UniversalProfile
        vm.deal(address(universalProfile), 100 ether);
        // check if UniversalProfile has 100 LYX
        assertEq((address(universalProfile)).balance, 100 ether);

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            randomEOA,
            10 ether,
            "0x"
        );
        vm.prank(universalProfileOwner);
        keyManager.transferLYXToEOA(transferPayload);
        // check if UniversalProfile has 90 LYX
        assertEq((address(universalProfile)).balance, 90 ether);
        // check if random EOA has 10 LYX
        assertEq((address(randomEOA)).balance, 10 ether);
    }

    function testTransferLYXToRandomUP() public {
        // give some LYX to UniversalProfile
        vm.deal(address(universalProfile), 100 ether);
        // check if UniversalProfile has 100 LYX
        assertEq((address(universalProfile)).balance, 100 ether);
        // transfer payload to random UP
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(randomUniversalProfile),
            10 ether,
            "0x"
        );
        vm.prank(universalProfileOwner);
        keyManager.transferLYXToUP(transferPayload);

        // check if UniversalProfile has 90 LYX
        assertEq((address(universalProfile)).balance, 90 ether);

        // check if random UP has 10 LYX
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
                address(universalProfile),
                address(randomUniversalProfile),
                10,
                false,
                "0x"
            )
        );
        vm.prank(universalProfileOwner);
        keyManager.transferTokensToRandomUP(transferPayload);

        // check if UniversalProfile has 90 tokens
        assertEq(digitalAsset.balanceOf(address(universalProfile)), 90);

        // check if random UP has 10 tokens
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
                address(universalProfile),
                randomEOA,
                10,
                true,
                "0x"
            )
        );
        vm.prank(universalProfileOwner);
        keyManager.transferTokensToRandomEOA(transferPayload);

        // check if UniversalProfile has 90 tokens
        assertEq(digitalAsset.balanceOf(address(universalProfile)), 90);

        // check if random EOA has 10 tokens
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
                address(universalProfile),
                randomUniversalProfile,
                bytes32(uint256(1)),
                false,
                "0x"
            )
        );
        vm.prank(universalProfileOwner);
        keyManager.transferNFTToRandomUP(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(universalProfile)), 0);

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
                address(universalProfile),
                randomEOA,
                bytes32(uint256(1)),
                true,
                "0x"
            )
        );
        vm.prank(universalProfileOwner);
        keyManager.transferNFTToRandomEOA(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(universalProfile)), 0);

        // check if random EOA is owner of tokenID 1
        assertEq(indentifiableDigitalAsset.tokenOwnerOf(bytes32(uint256(1))), address(randomEOA));
    }

    function _deployAndMintNFT() internal {
        indentifiableDigitalAsset = new LSP8Tester("TestLSP8", "TSTLSP8", digitalAssetsOwner);

        bytes32 tokenID = bytes32(uint256(1));

        // mint 100 tokens to UniversalProfile
        vm.prank(address(universalProfile));
        indentifiableDigitalAsset.mint(address(universalProfile), tokenID, false, "0x");

        // check if UniversalProfile has 100 tokens
        assertEq(indentifiableDigitalAsset.balanceOf(address(universalProfile)), 1);
    }

    function _deployandMintLSP7DigitalAsset() internal {
        digitalAsset = new LSP7Tester("TestLSP7", "TSTLSP7", digitalAssetsOwner);

        // mint 100 tokens to UniversalProfile
        vm.prank(address(universalProfile));
        digitalAsset.mint(address(universalProfile), 100, false, "0x");

        // check if UniversalProfile has 100 tokens
        assertEq(digitalAsset.balanceOf(address(universalProfile)), 100);
    }
}
