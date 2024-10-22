pragma solidity ^0.8.13;

// Testing utilities
import {Test} from "forge-std/Test.sol";
import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";
import {LSP6Utils} from "@lukso/lsp6-contracts/contracts/LSP6Utils.sol";

// Test setup
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {
    LSP6KeyManager
} from "@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol";

// errors
import {NotAuthorised} from "@lukso/lsp6-contracts/contracts/LSP6Errors.sol";

// constants
import {
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _PERMISSION_DEPLOY,
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
} from "@lukso/lsp6-contracts/contracts/LSP6Constants.sol";

contract LSP6Permissions is Test {
    ERC725 public mainAccount;
    LSP6KeyManager public keyManagerForAccount;
    address public mainAccountController;
    address public combineController;

    function setUp() public {
        mainAccountController = vm.addr(1);
        vm.label(mainAccountController, "mainAccountController");
        combineController = vm.addr(10);
        vm.label(combineController, "combineController");
        mainAccount = new ERC725(mainAccountController);

        // deploy LSP6KeyManager and link it to this account
        keyManagerForAccount = new LSP6KeyManager(address(mainAccount));
        vm.prank(mainAccountController);
        mainAccount.transferOwnership(address(keyManagerForAccount));
    }

    function testFail_evenWhenPermissionsGivenTwice() public {
        bytes32[] memory ownerPermissions = new bytes32[](3);
        ownerPermissions[0] = _PERMISSION_DEPLOY;
        ownerPermissions[1] = _PERMISSION_DEPLOY;
        _givePermissionsToController(
            mainAccount,
            combineController,
            address(keyManagerForAccount),
            ownerPermissions
        );
        bytes32 controllerPermissionDataKey = LSP2Utils
            .generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(combineController)
            );
        bytes32 controllerPermissions = bytes32(
            mainAccount.getData(controllerPermissionDataKey)
        );

        // CHECK that granting permission `DEPLOY` twice should not result in granting permission `SUPER_SETDATA`
        // - _PERMISSION_DEPLOY        = 0x0000000000000000000000000000000000000000000000000000000000010000;
        // - _PERMISSION_SUPER_SETDATA = 0x0000000000000000000000000000000000000000000000000000000000020000;
        assert(controllerPermissions == _PERMISSION_DEPLOY);

        vm.prank(combineController);

        // This should revert as the controller does not have the permission to setData but is only authorised to deploy contracts
        mainAccount.setData(
            bytes32(
                0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe
            ),
            hex"deadbeef"
        );
    }

    function _givePermissionsToController(
        IERC725Y account,
        address controller,
        address permissionGiver,
        bytes32[] memory permissions
    ) internal {
        bytes32 dataKey = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(controller)
        );

        bytes32 combinedPermissions = LSP6Utils.combinePermissions(permissions);
        bytes memory dataValue = abi.encodePacked(combinedPermissions);
        vm.prank(permissionGiver);

        account.setData(dataKey, dataValue);
    }
}
