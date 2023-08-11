pragma solidity ^0.8.13;

import "../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import "../GasTests/UniversalProfileTestsHelper.sol";

import {NotAuthorised} from "../../../contracts/LSP6KeyManager/LSP6Errors.sol";

import {
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";

contract LSP6RestrictedController is UniversalProfileTestsHelper {
    LSP0ERC725Account public mainUniversalProfile;
    LSP6KeyManager public keyManagerMainUP;
    address public mainUniversalProfileOwner;
    address public combineController;

    function setUp() public {
        mainUniversalProfileOwner = vm.addr(1);
        vm.label(mainUniversalProfileOwner, "mainUniversalProfileOwner");
        combineController = vm.addr(10);
        vm.label(combineController, "combineController");
        mainUniversalProfile = new LSP0ERC725Account(mainUniversalProfileOwner);

        // deploy LSP6KeyManager
        keyManagerMainUP = new LSP6KeyManager(address(mainUniversalProfile));
        transferOwnership(
            mainUniversalProfile,
            mainUniversalProfileOwner,
            address(keyManagerMainUP)
        );
    }

    function testFail_evenWhenPermissionsGivenTwice() public {
        bytes32[] memory ownerPermissions = new bytes32[](3);
        ownerPermissions[0] = _PERMISSION_DEPLOY;
        ownerPermissions[1] = _PERMISSION_DEPLOY;
        givePermissionsToController(
            mainUniversalProfile,
            combineController,
            address(keyManagerMainUP),
            ownerPermissions
        );
        bytes32 controllerPermissionDataKey = LSP2Utils
            .generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(combineController)
            );
        bytes32 controllerPermissions = bytes32(
            mainUniversalProfile.getData(controllerPermissionDataKey)
        );

        // CHECK that granting permission `DEPLOY` twice should not result in granting permission `SUPER_SETDATA`
        // - _PERMISSION_DEPLOY        = 0x0000000000000000000000000000000000000000000000000000000000010000;
        // - _PERMISSION_SUPER_SETDATA = 0x0000000000000000000000000000000000000000000000000000000000020000;
        assert(controllerPermissions == _PERMISSION_DEPLOY);

        vm.prank(combineController);

        // This should revert as the controller is only allowed to setData but only deploy contracts
        mainUniversalProfile.setData(
            bytes32(
                0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe
            ),
            hex"deadbeef"
        );
    }
}
