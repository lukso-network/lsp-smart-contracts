// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

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

import "../../../contracts/LSP6KeyManager/LSP6Utils.sol";

contract UniversalProfileTestsHelper is Test {
    function setURDToUPAndGivePermissions(
        LSP0ERC725Account universalProfile,
        address universalProfileOwner,
        address URD
    ) public {
        vm.startPrank(universalProfileOwner);
        universalProfile.setData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY,
            abi.encodePacked(URD)
        );

        // give SUPER_SETDATA permission to universalReceiverDelegate
        bytes32 dataKeyURD = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(abi.encodePacked(URD))
        );

        bytes32[] memory permissions = new bytes32[](2);

        permissions[0] = _PERMISSION_REENTRANCY;
        permissions[1] = _PERMISSION_SUPER_SETDATA;

        universalProfile.setData(
            dataKeyURD,
            abi.encodePacked(LSP6Utils.combinePermissions(permissions))
        );
        vm.stopPrank();
    }

    function generateCompactByteArrayElement(
        bytes[] memory data
    ) public pure returns (bytes memory) {
        uint256 totalLength = 0;
        bytes memory concatenatedBytes = new bytes(0);
        for (uint256 i = 0; i < data.length; i++) {
            totalLength += data[i].length;
            concatenatedBytes = bytes.concat(concatenatedBytes, data[i]);
        }

        //check that the total length is less than 256
        require(
            totalLength < type(uint16).max,
            "UniversalProfileHelper: CBA Element too big"
        );

        return bytes.concat(bytes2(uint16(totalLength)), concatenatedBytes);
    }

    function setAllowedCallsForController(
        LSP0ERC725Account universalProfile,
        address allowedCallsController,
        address universalProfileOwner,
        bytes4[] memory supportedStandards,
        address[] memory callContracts,
        bytes4[] memory callSignatures
    ) public {
        require(
            supportedStandards.length == callContracts.length &&
                callContracts.length == callSignatures.length,
            "UniversalProfileHelper: length of supportedStandards, callContracts and callSignatures are not equals"
        );

        bytes memory allowedCalls = new bytes(0);

        for (uint256 i = 0; i < supportedStandards.length; i++) {
            bytes[] memory newElement = new bytes[](4);
            newElement[0] = abi.encodePacked(bytes4(0x000000ff));
            newElement[1] = abi.encodePacked(callContracts[i]);
            newElement[2] = abi.encodePacked(supportedStandards[i]);
            newElement[3] = abi.encodePacked(callSignatures[i]);
            bytes memory generatedAllowedCall = generateCompactByteArrayElement(
                newElement
            );
            allowedCalls = bytes.concat(allowedCalls, generatedAllowedCall);
        }

        bytes32 dataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
            bytes20(allowedCallsController)
        );

        vm.prank(universalProfileOwner);
        universalProfile.setData(dataKey, allowedCalls);
    }

    function givePermissionsToController(
        LSP0ERC725Account universalProfile,
        address controller,
        address permissionGiver,
        bytes32[] memory permissions
    ) public {
        bytes32 dataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(controller)
        );

        bytes32 combinedPermissions = LSP6Utils.combinePermissions(permissions);
        bytes memory dataValue = abi.encodePacked(combinedPermissions);
        vm.prank(permissionGiver);

        universalProfile.setData(dataKey, dataValue);
    }

    function transferOwnership(
        LSP0ERC725Account universalProfile,
        address oldOwner,
        address newOwner
    ) public {
        // transfer ownership to keyManager
        vm.prank(oldOwner);
        universalProfile.transferOwnership(newOwner);

        // accept ownership of UniversalProfile as keyManager
        vm.prank(newOwner);
        universalProfile.acceptOwnership();

        // check if keyManager is owner of UniversalProfile
        assertEq(universalProfile.owner(), address(newOwner));
    }
}
