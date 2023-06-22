pragma solidity ^0.8.13;

import "../LSP6s/LSP6SetDataUC.sol";
import "../../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    _PERMISSION_SUPER_SETDATA,
    _PERMISSION_SUPER_CALL,
    _PERMISSION_REENTRANCY,
    _PERMISSION_SUPER_TRANSFERVALUE,
    _PERMISSION_CALL,
    _PERMISSION_TRANSFERVALUE,
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
    _PERMISSION_ADDCONTROLLER,
    _PERMISSION_SETDATA
} from "../../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import "../UniversalProfileTestsHelper.sol";

contract SetDataUnrestrictedController is UniversalProfileTestsHelper {
    LSP0ERC725Account public mainUniversalProfile;
    LSP0ERC725Account public randomUniversalProfile;
    LSP6SetDataUnrestrictedController public keyManagerMainUP;

    address public unrestrictedController;
    address public permissionsReceiver;

    function setUp() public {
        unrestrictedController = vm.addr(1);
        vm.label(unrestrictedController, "unrestrictedController");
        permissionsReceiver = vm.addr(2);
        vm.label(permissionsReceiver, "permissionsReceiver");
        unrestrictedController = vm.addr(5);
        vm.label(unrestrictedController, "unrestrictedController");

        mainUniversalProfile = new LSP0ERC725Account(unrestrictedController);

        // deploy LSP6KeyManagers
        keyManagerMainUP = new LSP6SetDataUnrestrictedController(
            address(mainUniversalProfile)
        );

        bytes32[] memory ownerPermissions = new bytes32[](3);
        ownerPermissions[0] = _PERMISSION_SUPER_CALL;
        ownerPermissions[1] = _PERMISSION_SUPER_TRANSFERVALUE;
        ownerPermissions[2] = _PERMISSION_ADDCONTROLLER;

        givePermissionsToController(
            mainUniversalProfile,
            unrestrictedController,
            unrestrictedController,
            ownerPermissions
        );

        transferOwnership(
            mainUniversalProfile,
            unrestrictedController,
            address(keyManagerMainUP)
        );
    }

    // give permissions to a controller (AddressPermissions[] + AddressPermissions[index] + AddressPermissions:Permissions:)
    function testGivePermissionsToController() public {
        bytes32[] memory keys = new bytes32[](3);
        bytes[] memory values = new bytes[](3);

        uint128 arrayLength = uint128(
            bytes16(
                mainUniversalProfile.getData(_LSP6KEY_ADDRESSPERMISSIONS_ARRAY)
            )
        );
        uint128 newArrayLength = arrayLength + 1;

        keys[0] = _LSP6KEY_ADDRESSPERMISSIONS_ARRAY;
        values[0] = abi.encodePacked(newArrayLength);

        keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
            arrayLength
        );
        values[1] = abi.encodePacked(permissionsReceiver);

        keys[2] = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(permissionsReceiver)
        );
        values[2] = abi.encodePacked(_PERMISSION_SUPER_CALL);

        // setData payload
        bytes memory payload = abi.encodeWithSignature(
            "setDataBatch(bytes32[],bytes[])",
            keys,
            values
        );

        // execute setData
        vm.prank(unrestrictedController);
        keyManagerMainUP.givePermissionsToController(payload);

        // test that permissions receiver can make an call on the mainUniversalProfile and does not revert
        bytes memory callPayload = abi.encodeWithSignature(
            "execute(uint256,address,uint256,bytes)",
            0,
            vm.addr(6),
            0,
            payload
        );
        vm.prank(permissionsReceiver);
        keyManagerMainUP.execute(callPayload);
    }

    // restrict a controller to some specific ERC725Y Data Keys
    function testRestrictControllerToERC725YKeys() public {
        bytes32[] memory keys = new bytes32[](2);
        bytes[] memory values = new bytes[](2);

        keys[0] = bytes32(
            bytes.concat(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes2(0),
                bytes20(permissionsReceiver)
            )
        );
        values[0] = abi.encodePacked(_PERMISSION_SETDATA);

        keys[1] = bytes32(
            bytes.concat(
                _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
                bytes2(0),
                bytes20(permissionsReceiver)
            )
        );
        // generate ERC725Y Data Keys
        bytes[] memory allowedERC725YDataKeys = new bytes[](1);
        allowedERC725YDataKeys[0] = abi.encodePacked(
            keccak256(abi.encodePacked("RandomKey"))
        );
        bytes
            memory allowedERC725YDataKeysCBA = generateCompactByteArrayElement(
                allowedERC725YDataKeys
            );
        values[1] = allowedERC725YDataKeysCBA;

        // setData payload
        bytes memory payload = abi.encodeWithSignature(
            "setDataBatch(bytes32[],bytes[])",
            keys,
            values
        );

        // execute setData
        vm.prank(unrestrictedController);
        keyManagerMainUP.restrictControllerToERC725YKeys(payload);

        // test that permissionsReceiver can setData for the allowed ERC725Y Data Keys
        bytes memory callPayload = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            keccak256(abi.encodePacked("RandomKey")),
            string("RandomValue")
        );

        vm.prank(permissionsReceiver);
        keyManagerMainUP.execute(callPayload);

        vm.prank(permissionsReceiver);
        bytes memory returnedValue = mainUniversalProfile.getData(
            keccak256(abi.encodePacked("RandomKey"))
        );
        assertEq(returnedValue, bytes(string("RandomValue")));
    }
}
