// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {GasLib} from "../../Utils/GasLib.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {LSP2Utils} from "../../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6Utils} from "../LSP6Utils.sol";

// errors
import "../LSP6Errors.sol";

//constants
import "../LSP6Constants.sol";
import {
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../../LSP1UniversalReceiver/LSP1Constants.sol";
import {_LSP17_EXTENSION_PREFIX} from "../../LSP17ContractExtension/LSP17Constants.sol";

abstract contract LSP6SetDataModule {
    using LSP6Utils for *;
    using BytesLib for bytes;

    function _verifySetDataPermissions(
        address from,
        bytes32 permissions,
        bytes calldata payload,
        address target
    ) internal view {
        if (bytes4(payload) == SETDATA_SELECTOR) {
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(payload[4:], (bytes32, bytes));

            // We don't allow the datakey: "0x0000000000000000000000000000000000000000000000000000000000000000" to be set
            if (inputKey == bytes32(0)) revert ZeroDataKeyNotAllowed();

            if (bytes16(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
                // CHECK if key = AddressPermissions[] or AddressPermissions[index]
                _verifyCanSetPermissionsArray(inputKey, inputValue, from, permissions, target);

            } else if (bytes6(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
                // CHECK for permission keys
                _verifyCanSetPermissions(inputKey, inputValue, from, permissions, target);

            } else if(
                inputKey == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
                bytes12(inputKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
            ) {
                // CHECK for Universal Receiver Delegate key
                _verifyCanSetUniversalReceiverDelegateKey(inputKey, from, permissions, target);

            } else if (bytes12(inputKey) == _LSP17_EXTENSION_PREFIX) {
                // CHECK for LSP17Extension data keys
                _verifyCanSetLSP17ExtensionKey(inputKey, from, permissions, target);

            } else {
                _verifyCanSetData(from, permissions, inputKey, target);
            }
        } else if (bytes4(payload) == SETDATA_ARRAY_SELECTOR) {
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi.decode(
                payload[4:],
                (bytes32[], bytes[])
            );

            bool isSettingERC725YDataKeys = false;

            // loop through each ERC725Y data keys
            for (uint256 ii = 0; ii < inputKeys.length; ii = GasLib.uncheckedIncrement(ii)) {
                bytes32 key = inputKeys[ii];
                bytes memory value = inputValues[ii];

                // We don't allow the datakey: "0x0000000000000000000000000000000000000000000000000000000000000000" to be set
                if (key == bytes32(0)) revert ZeroDataKeyNotAllowed();

                if (bytes16(key) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
                    // CHECK if key = AddressPermissions[] or AddressPermissions[index]
                    _verifyCanSetPermissionsArray(key, value, from, permissions, target);

                    // "nullify" permission keys to not check them against allowed ERC725Y data keys
                    inputKeys[ii] = bytes32(0);

                } else if (bytes6(key) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
                    // CHECK for permissions keys
                    _verifyCanSetPermissions(key, value, from, permissions, target);

                    // "nullify" permission keys to not check them against allowed ERC725Y data keys
                    inputKeys[ii] = bytes32(0);

                } else if(
                    key == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
                    bytes12(key) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
                ) {
                    // CHECK for Universal Receiver Delegate keys
                    _verifyCanSetUniversalReceiverDelegateKey(key, from, permissions, target);

                    // "nullify" URD keys to not check them against allowed ERC725Y data keys
                    inputKeys[ii] = bytes32(0);

                } else if (bytes12(key) == _LSP17_EXTENSION_PREFIX) {
                    // CHECK for LSP17Extension data keys
                    _verifyCanSetLSP17ExtensionKey(key, from, permissions, target);

                    // "nullify" LSP17Extension keys to not check them against allowed ERC725Y data keys
                    inputKeys[ii] = bytes32(0);
                } else {
                    // if the key is any other bytes32 key
                    isSettingERC725YDataKeys = true;
                }
            }

            if (isSettingERC725YDataKeys) {
                _verifyCanSetData(from, permissions, inputKeys, target);
            }
        }
    }

    /**
     * @dev verify if `_from` has the required permissions to update the permissions array
     * @param dataKey the dataKey whose dataValue will be updated
     * @param dataValue the updated dataValue for the dataKey
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     */
    function _verifyCanSetPermissionsArray(
        bytes32 dataKey,
        bytes memory dataValue,
        address from,
        bytes32 permissions,
        address target
    ) internal view {
        // dataKey = AddressPermissions[] -> array length
        if (dataKey == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {
            uint256 arrayLength = uint256(bytes32(ERC725Y(target).getData(dataKey)));
            uint256 newLength = uint256(bytes32(dataValue));

            if (newLength > arrayLength) {
                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
            } else {
                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
            }

            return;
        }

        // dataKey = AddressPermissions[index] -> array index
        bytes memory valueAtIndex = ERC725Y(target).getData(dataKey);

        if (valueAtIndex.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
        }

        if (dataValue.length != 0 && dataValue.length != 20) {
            revert AddressPermissionArrayIndexValueNotAnAddress(dataKey, dataValue);
        }
    }

    /**
     * @dev verify if `_from` is authorised to set some permissions for an address on the linked target
     * @param dataKey the dataKey whose dataValue will be updated
     * @param dataValue the updated dataValue for the dataKey
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions of 'from' for checking if authorised to set permissions related dataKeys.
     */
    function _verifyCanSetPermissions(
        bytes32 dataKey,
        bytes memory dataValue,
        address from,
        bytes32 permissions,
        address target
    ) internal view virtual {
        if (bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {
            // AddressPermissions:Permissions:<address>
            _verifyCanSetBytes32Permissions(dataKey, from, permissions, target);
        } else if (
            // AddressPermissions:AllowedCalls:<address>
            bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX ||
            // AddressPermissions:AllowedERC725YDataKeys:<address>
            bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
        ) {
            bool isClearingArray = dataValue.length == 0;

            if (!isClearingArray && !LSP2Utils.isCompactBytesArray(dataValue)) {
                if (bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX) {
                    revert InvalidEncodedAllowedCalls(dataValue);
                } else {
                    revert InvalidEncodedAllowedERC725YDataKeys(dataValue);
                }
            }

            bytes memory storedAllowedValues = ERC725Y(target).getData(dataKey);

            if (storedAllowedValues.length == 0) {
                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
            } else {
                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
            }
        } else {
            /**
             * if bytes6(dataKey) != bytes6(keccak256("AddressPermissions"))
             * this is not a standard permission dataKey according to LSP6
             * so we revert execution
             *
             * @dev to implement custom permissions dataKeys, consider overriding
             * this function and implement specific checks
             *
             *      // AddressPermissions:MyCustomPermissions:<address>
             *      bytes12 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf866c29110000
             *
             *      if (bytes12(dataKey) == CUSTOM_PERMISSION_PREFIX) {
             *          // custom logic
             *      }
             *      super._verifyCanSetPermissions(...)
             */
            revert NotRecognisedPermissionKey(dataKey);
        }
    }

    /**
     * @dev verify if `_from` has the required permissions to either
     * add or change permissions of another address
     * @param dataKey the dataKey whose value will be updated
     * @param from the address who want to set the dataKeys
     * @param callerPermissions the caller's permission's BitArray
     */
    function _verifyCanSetBytes32Permissions(
        bytes32 dataKey,
        address from,
        bytes32 callerPermissions,
        address target
    ) internal view {
        if (bytes32(ERC725Y(target).getData(dataKey)) == bytes32(0)) {
            // if there is nothing stored under this data dataKey,
            // we are trying to ADD permissions for a NEW address
            _requirePermissions(from, callerPermissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            // if there are already some permissions stored under this data dataKey,
            // we are trying to CHANGE the permissions of an address
            // (that has already some EXISTING permissions set)
            _requirePermissions(from, callerPermissions, _PERMISSION_CHANGEPERMISSIONS);
        }
    }

    /**
     * @dev Verify if `from` has the required permissions to either add or change the address
     * of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key
     * @param lsp1DataKey the dataKey to set with `_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX` as prefix
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     */
    function _verifyCanSetUniversalReceiverDelegateKey(
        bytes32 lsp1DataKey,
        address from,
        bytes32 permissions,
        address target
    ) internal view {
        bytes memory dataValue = ERC725Y(target).getData(lsp1DataKey);

        if (dataValue.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE);
        }
    }

    /**
     * @dev Verify if `from` has the required permissions to either add or change the address
     * of an LSP0 Extension stored under a specific LSP17Extension data key
     * @param lsp17ExtensionDataKey the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     */
    function _verifyCanSetLSP17ExtensionKey(
        bytes32 lsp17ExtensionDataKey,
        address from,
        bytes32 permissions,
        address target
    ) internal view {
        bytes memory dataValue = ERC725Y(target).getData(lsp17ExtensionDataKey);

        if (dataValue.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDEXTENSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEEXTENSIONS);
        }
    }

    /**
     * @dev verify if `_from` has the required permissions to set some dataKeys on the linked target
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     * @param inputKey the dataKey being set
     */
    function _verifyCanSetData(
        address from,
        bytes32 permissions,
        bytes32 inputKey,
        address target
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        bytes memory allowedERC725YKeysCompacted = ERC725Y(target).getAllowedERC725YDataKeysFor(
            from
        );
        _verifyAllowedERC725YSingleKey(from, inputKey, allowedERC725YKeysCompacted);
    }

    /**
     * @dev verify if `_from` has the required permissions to set some dataKeys
     * on the linked target
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     * @param inputKeys the dataKeys being set
     * containing a list of key-value pairs
     */
    function _verifyCanSetData(
        address from,
        bytes32 permissions,
        bytes32[] memory inputKeys,
        address target
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        bytes memory allowedERC725YDataKeysCompacted = ERC725Y(target).getAllowedERC725YDataKeysFor(
            from
        );
        _verifyAllowedERC725YDataKeys(from, inputKeys, allowedERC725YDataKeysCompacted);
    }

    /**
     * @dev Verify if the `inputKey` is present in `allowedERC725KeysCompacted` stored on the `from`'s ERC725Y contract
     */
    function _verifyAllowedERC725YSingleKey(
        address from,
        bytes32 inputKey,
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure {
        if (allowedERC725YDataKeysCompacted.length == 0) revert NoERC725YDataKeysAllowed(from);
        if (!LSP2Utils.isCompactBytesArray(allowedERC725YDataKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted);

        /**
         * pointer will always land on these values:
         *
         * ↓↓
         * 03 a00000
         * 05 fff83a0011
         * 20 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 12 bb000000000000000000000000000000beef
         * 19 cc00000000000000000000000000000000000000000000deed
         * ↑↑
         *
         * the pointer can only land on the length of the following bytes value.
         */
        uint256 pointer;

        /**
         * iterate over each key by saving in the `pointer` variable the index for
         * the length of the following key until the `pointer` reaches an undefined value
         *
         * 0x 03 a00000 03 fff83a 20 aa00...00cafe
         *    ↑↑        ↑↑        ↑↑
         *  first  |  second  |  third
         *  length |  length  |  length
         */
        while (pointer < allowedERC725YDataKeysCompacted.length) {
            /**
             * save the length of the following allowed key
             * which is saved in `AllowedERC725YDataKeys[pointer]`
             */
            uint256 length = uint256(uint8(bytes1(allowedERC725YDataKeysCompacted[pointer])));

            /*
             * transform the allowed key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 allowedKey = bytes32(
                allowedERC725YDataKeysCompacted.slice(pointer + 1, length)
            );

            /**
             * the bitmask discard the last `32 - length` bytes of the input key via ANDing &
             * so to compare only the relevant parts of each ERC725Y Data Keys
             *
             * E.g.:
             *
             * allowed key = 0xa00000
             *
             *      &     compare this part
             *                 vvvvvv
             * checked key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *                                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *        mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 mask = bytes32(
                0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            ) << (8 * (32 - length));

            if (allowedKey == (inputKey & mask)) {
                // voila you found the key ;)
                return;
            } else {
                // move the pointer to the index of the next key
                pointer += length + 1;
            }
        }

        revert NotAllowedERC725YDataKey(from, inputKey);
    }

    /**
     * @dev verify if `from` is allowed to change the `inputKey`
     * @param from the address who want to set the dataKeys
     * @param inputKeys the dataKey that is verified
     */
    function _verifyAllowedERC725YDataKeys(
        address from,
        bytes32[] memory inputKeys,
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure {
        if (allowedERC725YDataKeysCompacted.length == 0) revert NoERC725YDataKeysAllowed(from);
        if (!LSP2Utils.isCompactBytesArray(allowedERC725YDataKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted);

        uint256 allowedKeysFound;

        /**
         * pointer will always land on these values:
         *
         * ↓↓
         * 03 a00000
         * 05 fff83a0011
         * 20 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 12 bb000000000000000000000000000000beef
         * 19 cc00000000000000000000000000000000000000000000deed
         * ↑↑
         *
         * the pointer can only land on the length of the following bytes value.
         */
        uint256 pointer;

        /**
         * iterate over each key by saving in the `pointer` variable the index for
         * the length of the following key until the `pointer` reaches an undefined value
         *
         * 0x 03 a00000 03 fff83a 20 aa00...00cafe
         *    ↑↑        ↑↑        ↑↑
         *  first  |  second  |  third
         *  length |  length  |  length
         */
        while (
            allowedKeysFound < inputKeys.length && pointer < allowedERC725YDataKeysCompacted.length
        ) {
            /**
             * save the length of the following allowed key
             * which is saved in `AllowedERC725YDataKeys[pointer]`
             */
            uint256 length = uint256(uint8(bytes1(allowedERC725YDataKeysCompacted[pointer])));

            /*
             * transform the allowed key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 allowedKey = bytes32(
                allowedERC725YDataKeysCompacted.slice(pointer + 1, length)
            );

            /**
             * the bitmask discard the last `32 - length` bytes of the input key via ANDing &
             * so to compare only the relevant parts of each ERC725Y Data Keys
             *
             * E.g.:
             *
             * allowed key = 0xa00000
             *
             *      &     compare this part
             *                 vvvvvv
             * checked key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *                                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *        mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 mask = bytes32(
                0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            ) << (8 * (32 - length));

            /**
             * Iterate over the `inputKeys`
             * If the key is allowed, nullify it and increment `allowedKeysFound`,
             * If the key is not allowed, continue searching
             */
            for (uint256 i = 0; i < inputKeys.length; i++) {
                if (inputKeys[i] == bytes32(0)) continue;

                if (allowedKey == (inputKeys[i] & mask)) {
                    inputKeys[i] = bytes32(0);
                    allowedKeysFound++;
                }
            }

            /**
             * Check wether all the `inputKeys` were found and return
             * Otherwise move to the next AllowedERC725YDataKey
             */
            if (allowedKeysFound == inputKeys.length) {
                // voila you found the keys ;)
                return;
            } else {
                // move the pointer to the index of the next key
                pointer += length + 1;
            }
        }

        /**
         * Iterate over the `inputKeys` in order to find first not allowed ERC725Y Data Key and revert
         */
        for (uint256 i = 0; i < inputKeys.length; i++) {
            if (inputKeys[i] != bytes32(0)) revert NotAllowedERC725YDataKey(from, inputKeys[i]);
        }
    }

    /**
     * @dev revert if `from`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param from the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address from,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal virtual pure {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = permissionRequired.getPermissionName();
            revert NotAuthorised(from, permissionErrorString);
        }
    }
}
