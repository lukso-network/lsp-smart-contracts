// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import {SETDATA_ARRAY_SELECTOR} from "@erc725/smart-contracts/contracts/constants.sol";
import "./LSP6Constants.sol";

// errors
import {NotAuthorised} from "./LSP6Errors.sol";

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
     * @dev read the Allowed ERC725Y data keys of a `caller` on an ERC725Y `target` contract.
     * @param target an `IERC725Y` contract where to read the permissions.
     * @param caller the controller address to read the permissions from.
     * @return an abi-encoded array of allowed ERC725 keys that the controller address is allowed to interact with.
     */
    function getAllowedERC725YDataKeysFor(IERC725Y target, address caller)
        internal
        view
        returns (bytes memory)
    {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
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
     * @dev same as LSP2Utils.isCompactBytesArray with the additional requirement that each element must be 28 bytes long.
     *
     * @param allowedCallsCompacted a compact bytes array of tuples (bytes4,address,bytes4) to check.
     * @return true if the value passed is a valid compact bytes array of bytes28 elements according to LSP2, false otherwise.
     */
    function isCompactBytesArrayOfAllowedCalls(bytes memory allowedCallsCompacted)
        internal
        pure
        returns (bool)
    {
        uint256 pointer;

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
            // each entries in the allowedCalls (compact) array must be 28 bytes long
            if (elementLength != 28) return false;
            pointer += elementLength + 2;
        }
        if (pointer == allowedCallsCompacted.length) return true;
        return false;
    }

    /**
     * @dev same as LSP2Utils.isCompactBytesArray with the additional requirement that each element must be from 1 to 32 bytes long.
     *
     * @param allowedERC725YDataKeysCompacted a compact bytes array of ERC725Y Data Keys (full bytes32 data keys or bytesN prefix) to check.
     * @return true if the value passed is a valid compact bytes array of ERC725Y Data Keys, false otherwise.
     */
    function isCompactBytesArrayOfAllowedERC725YDataKeys(
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure returns (bool) {
        uint256 pointer;

        while (pointer < allowedERC725YDataKeysCompacted.length) {
            if (pointer + 1 >= allowedERC725YDataKeysCompacted.length) return false;
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

    /**
     * @dev combine multiple permissions into a single bytes32
     * Make sure that the sum of the values of the input array is less than 2^256-1 to avoid overflow.
     * @param _permissions the array of permissions to combine
     * @return a bytes32 containing the combined permissions
     */
    function combinePermissions(bytes32[] memory _permissions) internal pure returns (bytes32) {
        uint256 result = 0;
        for (uint256 i = 0; i < _permissions.length; i++) {
            result += uint256(_permissions[i]);
        }
        return bytes32(result);
    }

    function generatePermissionsKeysForController(
        IERC725Y _account,
        address _address,
        bytes32 permissions
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        uint128 arrayLength = uint128(bytes16(_account.getData(_LSP6KEY_ADDRESSPERMISSIONS_ARRAY)));
        uint128 newArrayLength = arrayLength + 1;

        keys[0] = _LSP6KEY_ADDRESSPERMISSIONS_ARRAY;
        values[0] = abi.encodePacked(newArrayLength);

        keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
            uint128(arrayLength)
        );
        values[1] = abi.encodePacked(_address);

        keys[2] = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(_address)
        );
        values[2] = abi.encodePacked(permissions);
    }

    /**
     * @dev returns the name of the permission as a string
     */
    function getPermissionName(bytes32 permission)
        internal
        pure
        returns (string memory errorMessage)
    {
        if (permission == _PERMISSION_CHANGEOWNER) return "TRANSFEROWNERSHIP";
        if (permission == _PERMISSION_EDITPERMISSIONS) return "EDITPERMISSIONS";
        if (permission == _PERMISSION_ADDCONTROLLER) return "ADDCONTROLLER";
        if (permission == _PERMISSION_ADDEXTENSIONS) return "ADDEXTENSIONS";
        if (permission == _PERMISSION_CHANGEEXTENSIONS) return "CHANGEEXTENSIONS";
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
    }
}
