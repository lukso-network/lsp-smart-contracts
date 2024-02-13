// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {
    ILSP20CallVerifier as ILSP20
} from "@lukso/lsp20-contracts/contracts/ILSP20CallVerifier.sol";

// modules
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {LSP6Utils} from "../LSP6Utils.sol";

// constants
import {
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
    _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
    _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
    _PERMISSION_SETDATA,
    _PERMISSION_SUPER_SETDATA,
    _PERMISSION_ADDCONTROLLER,
    _PERMISSION_EDITPERMISSIONS,
    _PERMISSION_ADDEXTENSIONS,
    _PERMISSION_CHANGEEXTENSIONS,
    _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE,
    _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE
} from "../LSP6Constants.sol";
import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import {
    _LSP17_EXTENSION_PREFIX
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";

// errors
import {
    ERC725Y_DataKeysValuesLengthMismatch
} from "@erc725/smart-contracts/contracts/errors.sol";
import {
    NotRecognisedPermissionKey,
    InvalidEncodedAllowedCalls,
    InvalidEncodedAllowedERC725YDataKeys,
    NoERC725YDataKeysAllowed,
    NotAllowedERC725YDataKey,
    NotAuthorised,
    KeyManagerCannotBeSetAsExtensionForLSP20Functions,
    InvalidDataValuesForDataKeys
} from "../LSP6Errors.sol";

abstract contract LSP6SetDataModule {
    using LSP6Utils for *;

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set a data key on the ERC725Y storage of the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is set.
     * @param controllerAddress the address of the controller who wants to set the data key.
     * @param controllerPermissions the permissions of the controller address.
     * @param inputDataKey the data key to set on the `controlledContract`.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     */
    function _verifyCanSetData(
        address controlledContract,
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes memory inputDataValue
    ) internal view virtual {
        bytes32 requiredPermission = _getPermissionRequiredToSetDataKey(
            controlledContract,
            controllerPermissions,
            inputDataKey,
            inputDataValue
        );

        // CHECK if allowed to set an ERC725Y Data Key
        if (requiredPermission == _PERMISSION_SETDATA) {
            // Skip if caller has SUPER permissions
            if (controllerPermissions.hasPermission(_PERMISSION_SUPER_SETDATA))
                return;

            _requirePermissions(
                controllerAddress,
                controllerPermissions,
                _PERMISSION_SETDATA
            );

            _verifyAllowedERC725YSingleKey(
                controllerAddress,
                inputDataKey,
                ERC725Y(controlledContract).getAllowedERC725YDataKeysFor(
                    controllerAddress
                )
            );
        } else {
            // Do not check again if we already checked that the controller had the permissions inside `_getPermissionRequiredToSetDataKey(...)`
            if (requiredPermission == bytes32(0)) return;

            // Otherwise CHECK the required permission if setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
            _requirePermissions(
                controllerAddress,
                controllerPermissions,
                requiredPermission
            );
        }
    }

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set an array of data keys on the ERC725Y storage of the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is set.
     * @param controller the address of the controller who wants to set the data key.
     * @param permissions the permissions of the controller address.
     * @param inputDataKeys an array of data keys to set on the `controlledContract`.
     * @param inputDataValues an array of data values to set for the `inputDataKeys`.
     */
    function _verifyCanSetData(
        address controlledContract,
        address controller,
        bytes32 permissions,
        bytes32[] memory inputDataKeys,
        bytes[] memory inputDataValues
    ) internal view virtual {
        if (inputDataKeys.length != inputDataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        bool isSettingERC725YKeys = false;
        bool[] memory validatedInputDataKeys = new bool[](inputDataKeys.length);
        uint256 inputDataKeysAllowed = 0;

        bytes32 requiredPermission;

        uint256 ii = 0;
        do {
            requiredPermission = _getPermissionRequiredToSetDataKey(
                controlledContract,
                permissions,
                inputDataKeys[ii],
                inputDataValues[ii]
            );

            if (requiredPermission == _PERMISSION_SETDATA) {
                isSettingERC725YKeys = true;
            } else {
                // if we did not check already the permissions of the controller inside `_getPermissionRequiredToSetDataKey(...)`
                if (requiredPermission != bytes32(0)) {
                    // CHECK the required permissions for setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
                    _requirePermissions(
                        controller,
                        permissions,
                        requiredPermission
                    );
                }

                validatedInputDataKeys[ii] = true;
                inputDataKeysAllowed++;
            }

            unchecked {
                ++ii;
            }
        } while (ii < inputDataKeys.length);

        // CHECK if allowed to set one (or multiple) ERC725Y Data Keys
        if (isSettingERC725YKeys) {
            // Skip if caller has SUPER permissions
            if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

            _requirePermissions(controller, permissions, _PERMISSION_SETDATA);

            _verifyAllowedERC725YDataKeys(
                controller,
                inputDataKeys,
                ERC725Y(controlledContract).getAllowedERC725YDataKeysFor(
                    controller
                ),
                validatedInputDataKeys,
                inputDataKeysAllowed
            );
        }
    }

    /**
     * @dev retrieve the permission required based on the data key to be set on the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputDataKey the data key to set on the `controlledContract`. Can be related to LSP6 Permissions, LSP1 Delegate or LSP17 Extensions.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     * @return the permission required to set the `inputDataKey` on the `controlledContract`.
     */
    function _getPermissionRequiredToSetDataKey(
        address controlledContract,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes memory inputDataValue
    ) internal view virtual returns (bytes32) {
        // AddressPermissions[] or AddressPermissions[index]
        if (bytes16(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
            // this is our best attempt to save gas to avoid reading the `target` storage multiple times
            // to know if we need the permission `ADDCONTROLLER` or `EDITPERMISSIONS`.
            // Even if `getData(...)` is `view`, multiple external calls to fetch values from storage add to the total gas used.
            bool hasBothAddControllerAndEditPermissions = controllerPermissions
                .hasPermission(
                    _PERMISSION_ADDCONTROLLER | _PERMISSION_EDITPERMISSIONS
                );

            return
                _getPermissionToSetPermissionsArray(
                    controlledContract,
                    inputDataKey,
                    inputDataValue,
                    hasBothAddControllerAndEditPermissions
                );

            // AddressPermissions:...
        } else if (bytes6(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
            // same as above, save gas by avoiding redundants or unecessary external calls to fetch values from the `target` storage.
            bool hasBothAddControllerAndEditPermissions = controllerPermissions
                .hasPermission(
                    _PERMISSION_ADDCONTROLLER | _PERMISSION_EDITPERMISSIONS
                );

            // AddressPermissions:Permissions:<address>
            if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
            ) {
                // CHECK that `dataValue` contains exactly 32 bytes, which is the required length for a permission BitArray
                if (inputDataValue.length != 32 && inputDataValue.length != 0) {
                    revert InvalidDataValuesForDataKeys(
                        inputDataKey,
                        inputDataValue
                    );
                }

                // controller already has the permissions needed. Do not run internal function.
                if (hasBothAddControllerAndEditPermissions) return (bytes32(0));

                return
                    _getPermissionToSetControllerPermissions(
                        controlledContract,
                        inputDataKey
                    );

                // AddressPermissions:AllowedCalls:<address>
            } else if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX
            ) {
                return
                    _getPermissionToSetAllowedCalls(
                        controlledContract,
                        inputDataKey,
                        inputDataValue,
                        hasBothAddControllerAndEditPermissions
                    );

                // AddressPermissions:AllowedERC725YKeys:<address>
            } else if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
            ) {
                return
                    _getPermissionToSetAllowedERC725YDataKeys(
                        controlledContract,
                        inputDataKey,
                        inputDataValue,
                        hasBothAddControllerAndEditPermissions
                    );

                // if the first 6 bytes of the input data key are "AddressPermissions:..." but did not match
                // with anything above, this is not a standard LSP6 permission data key so we revert.
            } else {
                /**
                 * @dev more permissions types starting with `AddressPermissions:...` can be implemented by overriding this function.
                 *
                 *      // AddressPermissions:MyCustomPermissions:<address>
                 *      bytes10 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba4
                 *
                 *      if (bytes10(dataKey) == CUSTOM_PERMISSION_PREFIX) {
                 *          // custom logic
                 *      }
                 *
                 *      super._getPermissionRequiredToSetDataKey(...)
                 */
                revert NotRecognisedPermissionKey(inputDataKey);
            }

            // LSP1UniversalReceiverDelegate or LSP1UniversalReceiverDelegate:<typeId>
        } else if (
            inputDataKey == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
            bytes12(inputDataKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
        ) {
            // CHECK that `dataValue` contains exactly 20 bytes, which corresponds to an address for a LSP1 Delegate contract
            if (inputDataValue.length != 20 && inputDataValue.length != 0) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // same as above. If controller has both permissions, do not read the `target` storage
            // to save gas by avoiding an extra external `view` call.
            if (
                controllerPermissions.hasPermission(
                    _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE |
                        _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE
                )
            ) {
                return bytes32(0);
            }

            return
                _getPermissionToSetLSP1Delegate(
                    controlledContract,
                    inputDataKey
                );

            // LSP17Extension:<bytes4>
        } else if (bytes12(inputDataKey) == _LSP17_EXTENSION_PREFIX) {
            // CHECK that `dataValue` contains exactly 20 or 21 bytes (if setting to forward value), which corresponds to an address for a LSP17 Extension
            if (
                inputDataValue.length != 20 &&
                inputDataValue.length != 21 &&
                inputDataValue.length != 0
            ) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // reverts when the address of the Key Manager is being set as extensions for lsp20 functions
            bytes4 selector = bytes4(inputDataKey << 96);

            if (
                (selector == ILSP20.lsp20VerifyCall.selector ||
                    selector == ILSP20.lsp20VerifyCallResult.selector)
            ) {
                if (address(bytes20(inputDataValue)) == address(this)) {
                    revert KeyManagerCannotBeSetAsExtensionForLSP20Functions();
                }
            }

            // same as above. If controller has both permissions, do not read the `target` storage
            // to save gas by avoiding an extra external `view` call.
            if (
                controllerPermissions.hasPermission(
                    _PERMISSION_ADDEXTENSIONS | _PERMISSION_CHANGEEXTENSIONS
                )
            ) {
                return bytes32(0);
            }

            return
                _getPermissionToSetLSP17Extension(
                    controlledContract,
                    inputDataKey
                );
        } else {
            return _PERMISSION_SETDATA;
        }
    }

    /**
     * @dev retrieve the permission required to update the `AddressPermissions[]` array data key defined in LSP6.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputDataKey either `AddressPermissions[]` (array length) or `AddressPermissions[index]` (array index)
     * @param inputDataValue the updated value for the `inputDataKey`. MUST be:
     *  - a `uint256` for `AddressPermissions[]` (array length)
     *  - an `address` or `0x` for `AddressPermissions[index]` (array entry).
     *
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetPermissionsArray(
        address controlledContract,
        bytes32 inputDataKey,
        bytes memory inputDataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        // AddressPermissions[] -> array length
        if (inputDataKey == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {
            // CHECK that `dataValue` is exactly 16 bytes long or `0x` (= not set), as the array length of `AddressPermissions[]` MUST be a `uint128` value.
            if (inputDataValue.length != 16 && inputDataValue.length != 0) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // if the controller already has both permissions from one of the two required,
            // No permission required as CHECK is already done. We don't need to read `target` storage.
            if (hasBothAddControllerAndEditPermissions) return bytes32(0);

            uint128 newLength = uint128(bytes16(inputDataValue));

            return
                newLength >
                    uint128(
                        bytes16(
                            ERC725Y(controlledContract).getData(inputDataKey)
                        )
                    )
                    ? _PERMISSION_ADDCONTROLLER
                    : _PERMISSION_EDITPERMISSIONS;
        }

        // AddressPermissions[index] -> array index

        // CHECK that we either ADD an address (20 bytes long) or REMOVE an address (0x)
        if (inputDataValue.length != 0 && inputDataValue.length != 20) {
            revert InvalidDataValuesForDataKeys(inputDataKey, inputDataValue);
        }

        // if the controller already has both permissions from one of the two required below,
        // No permission required as CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        return
            ERC725Y(controlledContract).getData(inputDataKey).length == 0
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to set permissions for a controller address.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputPermissionDataKey `AddressPermissions:Permissions:<controller-address>`.
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetControllerPermissions(
        address controlledContract,
        bytes32 inputPermissionDataKey
    ) internal view virtual returns (bytes32) {
        // extract the address of the controller from the data key `AddressPermissions:Permissions:<controller>`
        address controller = address(bytes20(inputPermissionDataKey << 96));

        bytes32 controllerPermissions = ERC725Y(controlledContract)
            .getPermissionsFor(controller);

        return
            // if there is nothing stored under the data key, we are trying to ADD a new controller.
            // if there are already some permissions set under the data key, we are trying to CHANGE the permissions of a controller.
            controllerPermissions == bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev Retrieve the permission required to set some AllowedCalls for a controller.
     * @param controlledContract The address of the ERC725Y contract from which to fetch the value of `dataKey`.
     * @param dataKey A data key ion the format `AddressPermissions:AllowedCalls:<controller-address>`.
     * @param dataValue The updated value for the `dataKey`. MUST be a bytes32[CompactBytesArray] of Allowed Calls.
     * @return Either ADD or EDIT PERMISSIONS.
     */
    function _getPermissionToSetAllowedCalls(
        address controlledContract,
        bytes32 dataKey,
        bytes memory dataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedCalls(dataValue)) {
            revert InvalidEncodedAllowedCalls(dataValue);
        }

        // if the controller already has both permissions from one of the two required below,
        // No permission required as CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        // extract the address of the controller from the data key `AddressPermissions:AllowedCalls:<controller>`
        address controller = address(bytes20(dataKey << 96));

        // if the controller exists and has some permissions set, this is considered as EDIT a "sub-set" of its permissions.
        // (even if the controller does not have any allowed calls set).
        return
            ERC725Y(controlledContract).getPermissionsFor(controller) ==
                bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev Retrieve the permission required to set some Allowed ERC725Y Data Keys for a controller.
     * @param controlledContract the address of the ERC725Y contract from which to fetch the value of `dataKey`.
     * @param dataKey A data key in the format `AddressPermissions:AllowedERC725YDataKeys:<controller-address>`.
     * @param dataValue The updated value for the `dataKey`. MUST be a bytes[CompactBytesArray] of Allowed ERC725Y Data Keys.
     * @return Either ADD or EDIT PERMISSIONS.
     */
    function _getPermissionToSetAllowedERC725YDataKeys(
        address controlledContract,
        bytes32 dataKey,
        bytes memory dataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(dataValue)) {
            revert InvalidEncodedAllowedERC725YDataKeys(
                dataValue,
                "couldn't VALIDATE the data value"
            );
        }

        // if the controller already has both permissions from one of the two required below,
        // CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        // extract the address of the controller from the data key `AddressPermissions:AllowedERC725YDataKeys:<controller>`
        address controller = address(bytes20(dataKey << 96));

        // if the controller exists and has some permissions set, this is considered as EDIT a "sub-set" of its permissions.
        // (even if the controller does not have any allowed ERC725Y data keys set).
        return
            ERC725Y(controlledContract).getPermissionsFor(controller) ==
                bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to either add or change the address
     * of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param lsp1DelegateDataKey either the data key for the default `LSP1UniversalReceiverDelegate`,
     * or a data key for a specific `LSP1UniversalReceiverDelegate:<typeId>`, starting with `_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX`.
     * @return either ADD or CHANGE UNIVERSALRECEIVERDELEGATE.
     */
    function _getPermissionToSetLSP1Delegate(
        address controlledContract,
        bytes32 lsp1DelegateDataKey
    ) internal view virtual returns (bytes32) {
        return
            ERC725Y(controlledContract).getData(lsp1DelegateDataKey).length == 0
                ? _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE
                : _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE;
    }

    /**
     * @dev Verify if `controller` has the required permissions to either add or change the address
     * of an LSP0 Extension stored under a specific LSP17Extension data key
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param lsp17ExtensionDataKey the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix.
     */
    function _getPermissionToSetLSP17Extension(
        address controlledContract,
        bytes32 lsp17ExtensionDataKey
    ) internal view virtual returns (bytes32) {
        return
            ERC725Y(controlledContract).getData(lsp17ExtensionDataKey).length ==
                0
                ? _PERMISSION_ADDEXTENSIONS
                : _PERMISSION_CHANGEEXTENSIONS;
    }

    /**
     * @dev Verify if the `inputKey` is present in the list of `allowedERC725KeysCompacted` for the `controllerAddress`.
     * @param controllerAddress the address of the controller.
     * @param inputDataKey the data key to verify against the allowed ERC725Y Data Keys for the `controllerAddress`.
     * @param allowedERC725YDataKeysCompacted a CompactBytesArray of allowed ERC725Y Data Keys for the `controllerAddress`.
     */
    function _verifyAllowedERC725YSingleKey(
        address controllerAddress,
        bytes32 inputDataKey,
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure virtual {
        if (allowedERC725YDataKeysCompacted.length == 0)
            revert NoERC725YDataKeysAllowed(controllerAddress);

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓↓↓
         * 0003 a00000
         * 0005 fff83a0011
         * 0020 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 0012 bb000000000000000000000000000000beef
         * 0019 cc00000000000000000000000000000000000000000000deed
         * ↑↑↑↑
         *
         */
        uint256 pointer;

        // information extracted from each Allowed ERC725Y Data Key.
        uint256 length;
        bytes32 allowedKey;
        bytes32 mask;

        /**
         * iterate over each data key and update the `pointer` variable with the index where to find the length of each data key.
         *
         * 0x 0003 a00000 0003 fff83a 0020 aa00...00cafe
         *    ↑↑↑↑        ↑↑↑↑        ↑↑↑↑
         *    first   |   second   |  third
         *    length  |   length   |  length
         */
        while (pointer < allowedERC725YDataKeysCompacted.length) {
            // save the length of the allowed data key to calculate the `mask`.
            length = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );

            /**
             * The length of a data key is 32 bytes.
             * Therefore we can have a fixed allowed data key which has
             * a length of 32 bytes or we can have a dynamic data key
             * which can have a length from 1 up to 31 bytes.
             */
            if (length == 0 || length > 32) {
                revert InvalidEncodedAllowedERC725YDataKeys(
                    allowedERC725YDataKeysCompacted,
                    "couldn't DECODE from storage"
                );
            }

            /**
             * The bitmask discard the last `32 - length` bytes of the input data key via ANDing &
             * It is used to compare only the relevant parts of each input data key against dynamic allowed data keys.
             *
             * E.g.:
             *
             * allowed data key = 0xa00000
             *
             *                compare this part
             *                    vvvvvv
             * input data key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *             &                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *           mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            mask =
                bytes32(
                    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                ) <<
                (8 * (32 - length));

            /*
             * transform the allowed data key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value.
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            // solhint-disable-next-line no-inline-assembly
            assembly {
                // the first 32 bytes word in memory (where allowedERC725YDataKeysCompacted is stored)
                // correspond to the total number of bytes in `allowedERC725YDataKeysCompacted`
                let offset := add(add(pointer, 2), 32)
                let memoryAt := mload(
                    add(allowedERC725YDataKeysCompacted, offset)
                )
                // MLOAD loads 32 bytes word, so we need to keep only the `length` number of bytes that makes up the allowed data key.
                allowedKey := and(memoryAt, mask)
            }

            if (allowedKey == (inputDataKey & mask)) return;

            // move the pointer to the index of the next allowed data key
            unchecked {
                pointer = pointer + (length + 2);
            }
        }

        revert NotAllowedERC725YDataKey(controllerAddress, inputDataKey);
    }

    /**
     * @dev Verify if all the `inputDataKeys` are present in the list of `allowedERC725KeysCompacted` of the `controllerAddress`.
     * @param controllerAddress the address of the controller.
     * @param inputDataKeys the data keys to verify against the allowed ERC725Y Data Keys of the `controllerAddress`.
     * @param allowedERC725YDataKeysCompacted a CompactBytesArray of allowed ERC725Y Data Keys of the `controllerAddress`.
     * @param validatedInputKeysList an array of booleans to store the result of the verification of each data keys checked.
     * @param allowedDataKeysFound the number of data keys that were previously validated for other permissions like `ADDCONTROLLER`, `EDITPERMISSIONS`, etc...
     */
    function _verifyAllowedERC725YDataKeys(
        address controllerAddress,
        bytes32[] memory inputDataKeys,
        bytes memory allowedERC725YDataKeysCompacted,
        bool[] memory validatedInputKeysList,
        uint256 allowedDataKeysFound
    ) internal pure virtual {
        if (allowedERC725YDataKeysCompacted.length == 0)
            revert NoERC725YDataKeysAllowed(controllerAddress);

        // cache the input data keys from the start
        uint256 inputKeysLength = inputDataKeys.length;

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓↓↓
         * 0003 a00000
         * 0005 fff83a0011
         * 0020 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 0012 bb000000000000000000000000000000beef
         * 0019 cc00000000000000000000000000000000000000000000deed
         * ↑↑↑↑
         *
         */
        uint256 pointer;

        // information extracted from each Allowed ERC725Y Data Key.
        uint256 length;
        bytes32 allowedKey;
        bytes32 mask;

        /**
         * iterate over each data key and update the `pointer` variable with the index where to find the length of each data key.
         *
         * 0x 0003 a00000 0003 fff83a 0020 aa00...00cafe
         *    ↑↑↑↑        ↑↑↑↑        ↑↑↑↑
         *    first   |   second   |  third
         *    length  |   length   |  length
         */
        while (pointer < allowedERC725YDataKeysCompacted.length) {
            // save the length of the allowed data key to calculate the `mask`.
            length = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );

            /**
             * The length of a data key is 32 bytes.
             * Therefore we can have a fixed allowed data key which has
             * a length of 32 bytes or we can have a dynamic data key
             * which can have a length from 1 up to 31 bytes.
             */
            if (length == 0 || length > 32) {
                revert InvalidEncodedAllowedERC725YDataKeys(
                    allowedERC725YDataKeysCompacted,
                    "couldn't DECODE from storage"
                );
            }

            /**
             * The bitmask discard the last `32 - length` bytes of the input data key via ANDing &
             * It is used to compare only the relevant parts of each input data key against dynamic allowed data keys.
             *
             * E.g.:
             *
             * allowed data key = 0xa00000
             *
             *                compare this part
             *                    vvvvvv
             * input data key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *             &                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *           mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            mask =
                bytes32(
                    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                ) <<
                (8 * (32 - length));

            /*
             * transform the allowed data key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value.
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            // solhint-disable-next-line no-inline-assembly
            assembly {
                // the first 32 bytes word in memory (where allowedERC725YDataKeysCompacted is stored)
                // correspond to the length of allowedERC725YDataKeysCompacted (= total number of bytes)
                let offset := add(add(pointer, 2), 32)
                let memoryAt := mload(
                    add(allowedERC725YDataKeysCompacted, offset)
                )
                allowedKey := and(memoryAt, mask)
            }

            /**
             * Iterate over the `inputDataKeys` to check them against the allowed data keys.
             * This until we have validated them all.
             */
            for (uint256 ii; ii < inputKeysLength; ) {
                // if the input data key has been marked as allowed previously,
                // SKIP it and move to the next input data key.
                if (validatedInputKeysList[ii]) {
                    unchecked {
                        ++ii;
                    }
                    continue;
                }

                // CHECK if the input data key is allowed.
                if ((inputDataKeys[ii] & mask) == allowedKey) {
                    // if the input data key is allowed, mark it as allowed
                    // and increment the number of allowed keys found.
                    validatedInputKeysList[ii] = true;

                    unchecked {
                        allowedDataKeysFound++;
                    }

                    // Continue checking until all the inputKeys` have been found.
                    if (allowedDataKeysFound == inputKeysLength) return;
                }

                unchecked {
                    ++ii;
                }
            }

            // Move the pointer to the next AllowedERC725YKey
            unchecked {
                pointer = pointer + (length + 2);
            }
        }

        // if we did not find all the input data keys, search for the first not allowed data key to revert.
        for (uint256 jj; jj < inputKeysLength; ) {
            if (!validatedInputKeysList[jj]) {
                revert NotAllowedERC725YDataKey(
                    controllerAddress,
                    inputDataKeys[jj]
                );
            }

            unchecked {
                jj++;
            }
        }
    }

    /**
     * @dev revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure virtual {
        if (!LSP6Utils.hasPermission(addressPermissions, permissionRequired)) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                permissionRequired
            );
            revert NotAuthorised(controller, permissionErrorString);
        }
    }
}
