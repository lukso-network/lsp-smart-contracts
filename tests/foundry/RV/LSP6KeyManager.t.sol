// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "./Constants.sol";
import {LSP0ERC725Account} from "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import {LSP2Utils} from "../../../contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6KeyManager} from "../../../contracts/LSP6KeyManager/LSP6KeyManager.sol";

// errors
import {NotAuthorised} from "../../../contracts/LSP6KeyManager/LSP6Errors.sol";

// constants
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../../contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import "../../../contracts/LSP6KeyManager/LSP6Constants.sol";
import {
    _LSP17_EXTENSION_PREFIX
} from "../../../contracts/LSP17ContractExtension/LSP17Constants.sol";
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";

abstract contract LSP6KeyManagerTest is Test {
    LSP0ERC725Account account;
    LSP6KeyManager keyManager;

    /*
     * Helper functions for getting data.
     */

    function getPermissionsKey(address controller) internal pure returns (bytes32) {
        return
            LSP2Utils.generateMappingWithGroupingKey(
                "AddressPermissions",
                "Permissions",
                controller
            );
    }

    function getAllowedCallsKey(address controller) internal pure returns (bytes32) {
        return
            LSP2Utils.generateMappingWithGroupingKey(
                "AddressPermissions",
                "AllowedCalls",
                controller
            );
    }

    function getAllowedERC725YDataKeysKey(address controller) internal pure returns (bytes32) {
        return
            LSP2Utils.generateMappingWithGroupingKey(
                "AddressPermissions",
                "AllowedERC725YDataKeys",
                controller
            );
    }

    function getExtensionKey(bytes4 selector) internal pure returns (bytes32) {
        return LSP2Utils.generateMappingKey(_LSP17_EXTENSION_PREFIX, selector);
    }

    function getUniversalReceiverDelegateKey() internal pure returns (bytes32) {
        return _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY;
    }

    function getMappedDelegateKey(bytes32 typeId) internal pure returns (bytes32) {
        return
            LSP2Utils.generateMappingKey(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX, bytes20(typeId));
    }

    function getPermissions(address controller) internal view returns (bytes32) {
        bytes32 key = getPermissionsKey(controller);
        return bytes32(account.getData(key));
    }

    /*
     * Helper functions for setting data.
     */

    function setPermissions(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        account.setData(key, abi.encodePacked(permissions));
    }

    function updatePermissions(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        bytes32 bitArray = bytes32(account.getData(key));
        account.setData(key, abi.encodePacked(bitArray | permissions));
    }

    function removePermissions(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        bytes32 bitArray = bytes32(account.getData(key));
        account.setData(key, abi.encodePacked(bitArray & ~permissions));
    }

    function setDataViaKeyManager(bytes32 key, bytes memory value) internal {
        keyManager.execute(
            abi.encodeWithSelector(bytes4(keccak256("setData(bytes32,bytes)")), key, value)
        );
    }

    function setPermissionsViaKeyManager(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        setDataViaKeyManager(key, abi.encodePacked(permissions));
    }

    function updatePermissionsViaKeyManager(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        bytes32 bitArray = bytes32(account.getData(key));
        setDataViaKeyManager(key, abi.encodePacked(bitArray | permissions));
    }

    function removePermissionsViaKeyManager(address controller, bytes32 permissions) internal {
        bytes32 key = getPermissionsKey(controller);
        bytes32 bitArray = bytes32(account.getData(key));
        setDataViaKeyManager(key, abi.encodePacked(bitArray & ~permissions));
    }

    function setPermissionsViaKeyManagerExcept(address controller, bytes32 permissions) internal {
        setPermissionsViaKeyManager(controller, ALL_PERMISSIONS & ~permissions);
    }

    function setArrayLengthViaKeyManager(uint256 length) internal {
        setDataViaKeyManager(_LSP6KEY_ADDRESSPERMISSIONS_ARRAY, abi.encodePacked(length));
    }

    function setAddressViaKeyManager(uint128 index, address newAddress) internal {
        bytes32 key = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
            index
        );

        setDataViaKeyManager(key, abi.encodePacked(newAddress));
    }

    function setExtensionViaKeyManager(bytes4 selector, address extension) internal {
        bytes32 key = getExtensionKey(selector);

        setDataViaKeyManager(key, abi.encodePacked(extension));
    }

    function setDelegateViaKeyManager(address delegate) internal {
        bytes32 key = getUniversalReceiverDelegateKey();

        setDataViaKeyManager(key, abi.encodePacked(delegate));
    }

    function setMappedDelegateViaKeyManager(bytes32 typeId, address delegate) internal {
        bytes32 key = getMappedDelegateKey(typeId);

        setDataViaKeyManager(key, abi.encodePacked(delegate));
    }

    function setAllowedCallViaKeyManager(
        address controller,
        bytes32 allowedCall // Single 28-byte allowed call for simplicity
    ) internal {
        bytes2 length = 0x001c;
        bytes memory compactArray = abi.encodePacked(length, bytes28(allowedCall));
        bytes32 key = getAllowedCallsKey(controller);
        setDataViaKeyManager(key, compactArray);
    }

    function setAllowedDataKeyViaKeyManager(
        address controller,
        bytes32 allowedDataKey // Single 32-byte allowed data key for simplicity
    ) internal {
        bytes2 length = 0x0020;
        bytes memory compactArray = abi.encodePacked(length, allowedDataKey);
        bytes32 key = getAllowedERC725YDataKeysKey(controller);
        setDataViaKeyManager(key, compactArray);
    }

    /*
     * Helper functions for managing ownership.
     */

    function transferOwnershipViaKeyManager(address newOwner) internal {
        keyManager.execute(abi.encodeWithSelector(account.transferOwnership.selector, newOwner));
    }

    function acceptOwnershipViaKeyManager() internal {
        keyManager.execute(abi.encodeWithSelector(account.acceptOwnership.selector));
    }

    /*
     * Helper functions for making external calls and deploying contracts.
     */

    function makeCallViaKeyManager(
        address target,
        uint256 valueToForward,
        uint256 valueToSpend,
        bytes memory data
    ) internal {
        keyManager.execute{value: valueToForward}(
            abi.encodeWithSelector(
                LSP0_EXECUTE_SELECTOR,
                OPERATION_0_CALL,
                target,
                valueToSpend,
                data
            )
        );
    }

    function deployWithCreateViaKeyManager(
        address target, // should be ignored by execute
        uint256 value,
        bytes memory data
    ) internal {
        keyManager.execute(
            abi.encodeWithSelector(LSP0_EXECUTE_SELECTOR, OPERATION_1_CREATE, target, value, data)
        );
    }

    function deployWithCreate2ViaKeyManager(
        address target, // should be ignored by execute
        uint256 value,
        bytes memory data
    ) internal {
        keyManager.execute(
            abi.encodeWithSelector(LSP0_EXECUTE_SELECTOR, OPERATION_2_CREATE2, target, value, data)
        );
    }

    function makeStaticCallViaKeyManager(address target, bytes memory data) internal {
        keyManager.execute(
            abi.encodeWithSelector(LSP0_EXECUTE_SELECTOR, OPERATION_3_STATICCALL, target, 0, data)
        );
    }

    function makeDelegateCallViaKeyManager(address target, bytes memory data) internal {
        keyManager.execute(
            abi.encodeWithSelector(LSP0_EXECUTE_SELECTOR, OPERATION_4_DELEGATECALL, target, 0, data)
        );
    }

    /**
     * - Creates account and key manager.
     * - Gives permissions to the creator and controller address.
     * - Transfers ownership to the key manager.
     */
    function initializeAccountAndKeyManager() internal {
        account = new LSP0ERC725Account(address(this));
        keyManager = new LSP6KeyManager(address(account));

        setPermissions(address(this), ALL_PERMISSIONS);

        account.transferOwnership(address(keyManager));

        // Requires _PERMISSION_CHANGEOWNER
        acceptOwnershipViaKeyManager();
    }

    /**
     * Expect a revert with the NotAuthorised error.
     */
    function expectRevert(address from, string memory requiredPermission) internal {
        vm.expectRevert(abi.encodeWithSelector(NotAuthorised.selector, from, requiredPermission));
    }
}
