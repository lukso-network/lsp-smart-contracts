// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {SETDATA_ARRAY_SELECTOR} from "@erc725/smart-contracts/contracts/constants.sol";
import "../LSP6KeyManager/LSP6Constants.sol";

library LSP6Utils {
    using LSP2Utils for bytes12;

    /**
     * @dev read the permissions of a `caller` on an ERC725Y `target` contract.
     * @param target an `IERC725Y` contract where to read the permissions.
     * @param caller the controller address to read the permissions from.
     * @return a `bytes32` BitArray containing the permissions of a controller address.
     */
    function getPermissionsFor(IERC725Y target, address caller) internal view returns (bytes32) {
        bytes memory permissions = target.getData(
            LSP2Utils.generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(caller)
            )
        );

        return bytes32(permissions);
    }

    function getAllowedCallsFor(IERC725Y target, address from)
        internal
        view
        returns (bytes memory)
    {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
                    bytes20(from)
                )
            );
    }

    /**
     * @dev read the allowed ERC725Y keys of a `caller` on an ERC725Y `target` contract.
     * @param target an `IERC725Y` contract where to read the permissions.
     * @param caller the controller address to read the permissions from.
     * @return an abi-encoded array of allowed ERC725 keys that the controller address is allowed to interact with.
     */
    function getAllowedERC725YKeysFor(IERC725Y target, address caller)
        internal
        view
        returns (bytes memory)
    {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDERC725YKEYS_PREFIX,
                    bytes20(caller)
                )
            );
    }

    /**
     * @dev compare the permissions `addressPermissions` of an address
     *      to check if they includes the permissions `permissionToCheck`
     * @param addressPermission the permissions of an address stored on an ERC725 account
     * @param permissionToCheck the permissions to check
     * @return true if `addressPermissions` includes `permissionToCheck`, false otherwise
     */
    function hasPermission(bytes32 addressPermission, bytes32 permissionToCheck)
        internal
        pure
        returns (bool)
    {
        return (addressPermission & permissionToCheck) == permissionToCheck;
    }

    /**
     * @dev use the `setData(bytes32[],bytes[])` via the KeyManager of the target
     * @param keyManagerAddress the address of the KeyManager
     * @param keys the array of data keys
     * @param values the array of data values
     */
    function setDataViaKeyManager(
        address keyManagerAddress,
        bytes32[] memory keys,
        bytes[] memory values
    ) internal returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(SETDATA_ARRAY_SELECTOR, keys, values);
        result = ILSP6KeyManager(keyManagerAddress).execute(payload);
    }
}
