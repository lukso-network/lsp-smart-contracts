// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "../LSP6s/LSP6ExecuteRC.sol";
import "../../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../../contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
import "../../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../../../../contracts/Mocks/Tokens/LSP7Tester.sol";
import "../../../../contracts/Mocks/Tokens/LSP8Tester.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    _PERMISSION_SUPER_SETDATA,
    _PERMISSION_SUPER_CALL,
    _PERMISSION_REENTRANCY,
    _PERMISSION_SUPER_TRANSFERVALUE,
    _PERMISSION_CALL,
    _PERMISSION_TRANSFERVALUE
} from "../../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import {
    _LSP8_TOKENID_TYPE_NUMBER
} from "../../../../contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../UniversalProfileTestsHelper.sol";

contract ExecuteRestrictedController is UniversalProfileTestsHelper {
    LSP0ERC725Account public mainUniversalProfile;
    LSP0ERC725Account public randomUniversalProfile;
    LSP1UniversalReceiverDelegateUP public universalReceiverDelegate;
    LSP6ExecuteRestrictedController public keyManagerMainUP;
    LSP6ExecuteRestrictedController public keyManagerRandomUP;
    LSP7Tester public digitalAsset;
    LSP8Tester public indentifiableDigitalAsset;

    address public mainUniversalProfileOwner;
    address public randomUniversalProfileOwner;
    address public randomEOA;
    address public digitalAssetsOwner;
    address public restrictedController;

    function setUp() public {
        mainUniversalProfileOwner = vm.addr(1);
        vm.label(mainUniversalProfileOwner, "mainUniversalProfileOwner");
        randomEOA = vm.addr(2);
        vm.label(randomEOA, "randomEOA");
        digitalAssetsOwner = vm.addr(3);
        vm.label(digitalAssetsOwner, "digitalAssetsOwner");
        randomUniversalProfileOwner = vm.addr(4);
        restrictedController = vm.addr(5);
        vm.label(restrictedController, "restrictedController");

        mainUniversalProfile = new LSP0ERC725Account(mainUniversalProfileOwner);
        randomUniversalProfile = new LSP0ERC725Account(
            randomUniversalProfileOwner
        );

        universalReceiverDelegate = new LSP1UniversalReceiverDelegateUP();

        // deploy LSP6KeyManagers
        keyManagerMainUP = new LSP6ExecuteRestrictedController(
            address(mainUniversalProfile)
        );
        keyManagerRandomUP = new LSP6ExecuteRestrictedController(
            address(randomUniversalProfile)
        );

        setURDToUPAndGivePermissions(
            mainUniversalProfile,
            mainUniversalProfileOwner,
            address(universalReceiverDelegate)
        );
        setURDToUPAndGivePermissions(
            randomUniversalProfile,
            randomUniversalProfileOwner,
            address(universalReceiverDelegate)
        );

        bytes32[] memory ownerPermissions = new bytes32[](3);
        ownerPermissions[0] = _PERMISSION_SUPER_CALL;
        ownerPermissions[1] = _PERMISSION_SUPER_TRANSFERVALUE;

        givePermissionsToController(
            mainUniversalProfile,
            mainUniversalProfileOwner,
            mainUniversalProfileOwner,
            ownerPermissions
        );

        givePermissionsToController(
            randomUniversalProfile,
            randomUniversalProfileOwner,
            randomUniversalProfileOwner,
            ownerPermissions
        );

        transferOwnership(
            mainUniversalProfile,
            mainUniversalProfileOwner,
            address(keyManagerMainUP)
        );
        transferOwnership(
            randomUniversalProfile,
            randomUniversalProfileOwner,
            address(keyManagerRandomUP)
        );
    }

    function testTransferLYXToEOA() public {
        // give some LYX to UniversalProfile
        vm.deal(address(mainUniversalProfile), 100 ether);
        assertEq((address(mainUniversalProfile)).balance, 100 ether);

        // give TransferValue and CALL permissions to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](2);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;
        restrictedControllerPermissions[1] = _PERMISSION_TRANSFERVALUE;
        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);

        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = randomEOA;

        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

        // transfer payload to random EOA
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            randomEOA,
            10 ether,
            ""
        );
        vm.prank(restrictedController);
        keyManagerMainUP.transferLYXToEOA(transferPayload);

        assertEq((address(mainUniversalProfile)).balance, 90 ether);
        assertEq(randomEOA.balance, 10 ether);
    }

    function testTransferLYXToRandomUP() public {
        // give some LYX to UniversalProfile
        vm.deal(address(mainUniversalProfile), 100 ether);
        assertEq((address(mainUniversalProfile)).balance, 100 ether);

        // give TransferValue and CALL permissions to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](2);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;
        restrictedControllerPermissions[1] = _PERMISSION_TRANSFERVALUE;
        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);

        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = randomEOA;

        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

        // transfer payload to random UP
        bytes memory transferPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            address(randomUniversalProfile),
            10 ether,
            ""
        );
        vm.prank(mainUniversalProfileOwner);
        keyManagerMainUP.transferLYXToUP(transferPayload);

        assertEq((address(mainUniversalProfile)).balance, 90 ether);
        assertEq((address(randomUniversalProfile)).balance, 10 ether);
    }

    function testTransferTokensToRandomUP() public {
        _deployandMintLSP7DigitalAsset();

        // give Call permission to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](1);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;

        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);
        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = address(digitalAsset);
        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

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
                ""
            )
        );

        vm.prank(restrictedController);
        keyManagerMainUP.transferTokensToRandomUP(transferPayload);

        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 90);
        assertEq(digitalAsset.balanceOf(address(randomUniversalProfile)), 10);
    }

    function testTransferTokensToRandomEOA() public {
        _deployandMintLSP7DigitalAsset();

        // give Call permission to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](1);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;

        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);
        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = address(digitalAsset);
        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

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
                ""
            )
        );
        vm.prank(restrictedController);
        keyManagerMainUP.transferTokensToRandomEOA(transferPayload);

        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 90);
        assertEq(digitalAsset.balanceOf(address(randomEOA)), 10);
    }

    function testTransferNFTToRandomUP() public {
        _deployAndMintNFT();

        // give Call permission to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](1);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;

        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);
        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = address(indentifiableDigitalAsset);
        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

        // transfer payload to random UP
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
                ""
            )
        );
        vm.prank(restrictedController);
        keyManagerMainUP.transferNFTToRandomUP(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(
            indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)),
            0
        );

        // check if random EOA is owner of tokenID 1
        assertEq(
            indentifiableDigitalAsset.tokenOwnerOf(bytes32(uint256(1))),
            address(randomUniversalProfile)
        );
    }

    function testTransferNFTToRandomEOA() public {
        _deployAndMintNFT();

        // give Call permission to restrictedController
        bytes32[] memory restrictedControllerPermissions = new bytes32[](1);
        restrictedControllerPermissions[0] = _PERMISSION_CALL;

        givePermissionsToController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            restrictedControllerPermissions
        );

        // set allowedCalls for restrictedController
        bytes4[] memory callSignatures = new bytes4[](1);
        callSignatures[0] = bytes4(type(uint32).max);
        address[] memory callContractsAddresses = new address[](1);
        callContractsAddresses[0] = address(indentifiableDigitalAsset);
        bytes4[] memory supportedStandards = new bytes4[](1);
        supportedStandards[0] = bytes4(type(uint32).max);

        UniversalProfileTestsHelper.setAllowedCallsForController(
            mainUniversalProfile,
            restrictedController,
            address(keyManagerMainUP),
            callSignatures,
            callContractsAddresses,
            supportedStandards
        );

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
                ""
            )
        );
        vm.prank(restrictedController);
        keyManagerMainUP.transferNFTToRandomEOA(transferPayload);

        // check if UniversalProfile has 0 tokens
        assertEq(
            indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)),
            0
        );

        // check if random EOA is owner of tokenID 1
        assertEq(
            indentifiableDigitalAsset.tokenOwnerOf(bytes32(uint256(1))),
            address(randomEOA)
        );
    }

    function _deployAndMintNFT() internal {
        indentifiableDigitalAsset = new LSP8Tester(
            "TestLSP8",
            "TSTLSP8",
            digitalAssetsOwner,
            _LSP8_TOKENID_TYPE_NUMBER
        );

        bytes32 tokenID = bytes32(uint256(1));

        // mint 100 tokens to UniversalProfile
        vm.prank(address(mainUniversalProfile));
        indentifiableDigitalAsset.mint(
            address(mainUniversalProfile),
            tokenID,
            false,
            ""
        );

        // check if UniversalProfile has 100 tokens
        assertEq(
            indentifiableDigitalAsset.balanceOf(address(mainUniversalProfile)),
            1
        );
    }

    function _deployandMintLSP7DigitalAsset() internal {
        digitalAsset = new LSP7Tester(
            "TestLSP7",
            "TSTLSP7",
            digitalAssetsOwner
        );

        // mint 100 tokens to UniversalProfile
        vm.prank(address(mainUniversalProfile));
        digitalAsset.mint(address(mainUniversalProfile), 100, false, "");

        // check if UniversalProfile has 100 tokens
        assertEq(digitalAsset.balanceOf(address(mainUniversalProfile)), 100);
    }
}
