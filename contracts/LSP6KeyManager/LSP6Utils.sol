// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
    _PERMISSION_CHANGEOWNER,
    _PERMISSION_EDITPERMISSIONS,
    _PERMISSION_ADDCONTROLLER,
    _PERMISSION_ADDEXTENSIONS,
    _PERMISSION_CHANGEEXTENSIONS,
    _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE,
    _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE,
    _PERMISSION_REENTRANCY,
    _PERMISSION_SETDATA,
    _PERMISSION_CALL,
    _PERMISSION_STATICCALL,
    _PERMISSION_DELEGATECALL,
    _PERMISSION_DEPLOY,
    _PERMISSION_TRANSFERVALUE,
    _PERMISSION_SIGN
} from "./LSP6Constants.sol";

/**
 * @title LSP6 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>, Maxime Viard <SkimaHarvey>
 * @dev LSP6Utils is a library of utility functions that can be used to retrieve, check and set LSP6 permissions stored under the ERC725Y storage
 * of a smart contract.
 * Based on the LSP6 Key Manager standard.
 */
library LSP6Utils {
    using LSP2Utils for bytes12;

    /**
     * @dev Read the permissions of a `caller` on an ERC725Y `target` contract.
     *
     * @param target An `IERC725Y` contract where to read the permissions.
     * @param caller The controller address to read the permissions from.
     *
     * @return A `bytes32` BitArray containing the permissions of a controller address.
     *
     * @custom:info If the raw value fetched from the ERC725Y storage of `target` is not 32 bytes long, this is considered
     * like _"no permissions are set"_ and will return 32 x `0x00` bytes as `bytes32(0)`.
     */
    function getPermissionsFor(
        IERC725Y target,
        address caller
    ) internal view returns (bytes32) {
        bytes memory permissions = target.getData(
            LSP2Utils.generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(caller)
            )
        );

        if (permissions.length != 32) {
            return bytes32(0);
        }

        return bytes32(permissions);
    }

    function getAllowedCallsFor(
        IERC725Y target,
        address from
    ) internal view returns (bytes memory) {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
                    bytes20(from)
                )
            );
    }

    /**
     * @dev Read the Allowed ERC725Y data keys of a `caller` on an ERC725Y `target` contract.
     *
     * @param target An `IERC725Y` contract where to read the permissions.
     * @param caller The controller address to read the permissions from.
     *
     * @return An abi-encoded array of allowed ERC725 data keys that the controller address is allowed to interact with.
     */
    function getAllowedERC725YDataKeysFor(
        IERC725Y target,
        address caller
    ) internal view returns (bytes memory) {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
                    bytes20(caller)
                )
            );
    }

    /**
     * @dev Compare the permissions `controllerPermissions` of a controller address to check if they includes the permissions `permissionToCheck`.
     *
     * @param controllerPermissions The permissions of an address.
     * @param permissionToCheck The permissions to check if the controller has under its `controllerPermissions`.
     *
     * @return `true` if `controllerPermissions` includes `permissionToCheck`, `false` otherwise.
     */
    function hasPermission(
        bytes32 controllerPermissions,
        bytes32 permissionToCheck
    ) internal pure returns (bool) {
        return (controllerPermissions & permissionToCheck) == permissionToCheck;
    }

    /**
     * @dev Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be 32 bytes long.
     *
     * @param allowedCallsCompacted A compact bytes array of tuples `(bytes4,address,bytes4,bytes4)` to check (defined as `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` in LSP6).
     *
     * @return `true` if the value passed is a valid compact bytes array of bytes32 AllowedCalls elements, `false` otherwise.
     */
    function isCompactBytesArrayOfAllowedCalls(
        bytes memory allowedCallsCompacted
    ) internal pure returns (bool) {
        uint256 pointer = 0;

        while (pointer < allowedCallsCompacted.length) {
            if (pointer + 1 >= allowedCallsCompacted.length) return false;
            uint256 elementLength = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedCallsCompacted[pointer],
                        allowedCallsCompacted[pointer + 1]
                    )
                )
            );
            // each entries in the allowedCalls (compact) array must be 32 bytes long
            if (elementLength != 32) return false;
            pointer += elementLength + 2;
        }
        if (pointer == allowedCallsCompacted.length) return true;
        return false;
    }

    /**
     * @dev Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be from 1 to 32 bytes long.
     *
     * @param allowedERC725YDataKeysCompacted a compact bytes array of ERC725Y data Keys (full bytes32 data keys or bytesN prefix) to check (defined as `bytes[CompactBytesArray]`).
     *
     * @return `true` if the value passed is a valid compact bytes array of bytes32 Allowed ERC725Y data keys, `false` otherwise.
     */
    function isCompactBytesArrayOfAllowedERC725YDataKeys(
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure returns (bool) {
        uint256 pointer = 0;

        while (pointer < allowedERC725YDataKeysCompacted.length) {
            if (pointer + 1 >= allowedERC725YDataKeysCompacted.length)
                return false;
            uint256 elementLength = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );
            // the length of the allowed data key must be not under 33 bytes and not 0
            if (elementLength == 0 || elementLength > 32) return false;
            pointer += elementLength + 2;
        }
        if (pointer == allowedERC725YDataKeysCompacted.length) return true;
        return false;
    }

    /**
     * @dev Use the `setData(bytes32[],bytes[])` function via the KeyManager on the target contract.
     *
     * @param keyManagerAddress The address of the KeyManager.
     * @param keys The array of `bytes32[]` data keys.
     * @param values The array of `bytes[]` data values.
     */
    function setDataViaKeyManager(
        address keyManagerAddress,
        bytes32[] memory keys,
        bytes[] memory values
    ) internal returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setDataBatch.selector,
            keys,
            values
        );
        result = ILSP6KeyManager(keyManagerAddress).execute(payload);
    }

    /**
     * @dev Combine multiple permissions into a single `bytes32`.
     * Make sure that the sum of the values of the input array is less than `2^256-1 to avoid overflow.
     *
     * @param permissions The array of permissions to combine.
     * @return A `bytes32` value containing the combined permissions.
     */
    function combinePermissions(
        bytes32[] memory permissions
    ) internal pure returns (bytes32) {
        bytes32 result;
        for (uint256 i; i < permissions.length; i++) {
            result |= permissions[i];
        }
        return result;
    }

    /**
     * @dev Generate a new set of 3 x LSP6 permission data keys to add a new `controller` on `account`.
     * @param account The ERC725Y contract to add the controller into (used to fetch the `LSP6Permissions[]` length).
     * @param controller The address of the controller to grant permissions to.
     * @param permissions The `BitArray` of permissions to grant to the controller.
     * @return keys An array of 3 x data keys containing:
     * - `keys[0] = AddressPermissions[]` (array length).
     * - `keys[1] = AddressPermissions[index]` (where to store the controller address).
     * - `keys[2] = AddressPermissions:Permissions:<controller>`.
     *
     * @return values An array of 3 x data values containing:
     * - `values[0] =` the new array length of `AddressPermissions[]`
     * - `values[1] =` the address of the controller
     * - `values[2] =` the `permissions` passed as param
     */
    function generateNewPermissionsKeys(
        IERC725Y account,
        address controller,
        bytes32 permissions
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        uint128 arrayLength = uint128(
            bytes16(account.getData(_LSP6KEY_ADDRESSPERMISSIONS_ARRAY))
        );
        uint128 newArrayLength = arrayLength + 1;

        keys[0] = _LSP6KEY_ADDRESSPERMISSIONS_ARRAY;
        values[0] = abi.encodePacked(newArrayLength);

        keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
            arrayLength
        );
        values[1] = abi.encodePacked(controller);

        keys[2] = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(controller)
        );
        values[2] = abi.encodePacked(permissions);
    }

    /**
     * @dev Returns the name of the permission as a string.
     *
     * @param permission The low-level `bytes32` permission as a `BitArray` to get the permission name from.
     *
     * @return The string name of the `bytes32` permission value.
     */
    function getPermissionName(
        bytes32 permission
    ) internal pure returns (string memory) {
        if (permission == _PERMISSION_CHANGEOWNER) return "TRANSFEROWNERSHIP";
        if (permission == _PERMISSION_EDITPERMISSIONS) return "EDITPERMISSIONS";
        if (permission == _PERMISSION_ADDCONTROLLER) return "ADDCONTROLLER";
        if (permission == _PERMISSION_ADDEXTENSIONS) return "ADDEXTENSIONS";
        if (permission == _PERMISSION_CHANGEEXTENSIONS)
            return "CHANGEEXTENSIONS";
        if (permission == _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE)
            return "ADDUNIVERSALRECEIVERDELEGATE";
        if (permission == _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE)
            return "CHANGEUNIVERSALRECEIVERDELEGATE";
        if (permission == _PERMISSION_REENTRANCY) return "REENTRANCY";
        if (permission == _PERMISSION_SETDATA) return "SETDATA";
        if (permission == _PERMISSION_CALL) return "CALL";
        if (permission == _PERMISSION_STATICCALL) return "STATICCALL";
        if (permission == _PERMISSION_DELEGATECALL) return "DELEGATECALL";
        if (permission == _PERMISSION_DEPLOY) return "DEPLOY";
        if (permission == _PERMISSION_TRANSFERVALUE) return "TRANSFERVALUE";
        if (permission == _PERMISSION_SIGN) return "SIGN";
        return "";
    }
}
