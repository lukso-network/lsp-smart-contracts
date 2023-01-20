// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// modules
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import {GasLib} from "../Utils/GasLib.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {LSP6Utils} from "./LSP6Utils.sol";
import {EIP191Signer} from "../Custom/EIP191Signer.sol";

// errors
import "./LSP6Errors.sol";

// constants
import {
    OPERATION_0_CALL,
    OPERATION_1_CREATE,
    OPERATION_2_CREATE2,
    OPERATION_3_STATICCALL,
    OPERATION_4_DELEGATECALL,
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR,
    EXECUTE_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";

import {
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
    _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
} from "../LSP1UniversalReceiver/LSP1Constants.sol";

import "./LSP6Constants.sol";

import {_LSP17_EXTENSION_PREFIX} from "../LSP17ContractExtension/LSP17Constants.sol";

/**
 * @title Core implementation of the LSP6 Key Manager standard.
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev This contract acts as a controller for an ERC725 Account.
 *      Permissions for controllers are stored in the ERC725Y storage of the ERC725 Account and can be updated using `setData(...)`.
 */
abstract contract LSP6KeyManagerCore is ERC165, ILSP6KeyManager {
    using LSP6Utils for *;
    using Address for address;
    using ECDSA for bytes32;
    using ERC165Checker for address;
    using EIP191Signer for address;
    using BytesLib for bytes;

    address internal _target;

    // Variables, methods and modifier used for ReentrancyGuard are taken from the link below and modified accordingly.
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.8/contracts/security/ReentrancyGuard.sol
    bool private _reentrancyStatus;

    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    function target() public view returns (address) {
        return _target;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP6 ||
            interfaceId == _INTERFACEID_ERC1271 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function getNonce(address from, uint128 channelId) public view returns (uint256) {
        uint256 nonceInChannel = _nonceStore[from][channelId];
        return (uint256(channelId) << 128) | nonceInChannel;
    }

    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(bytes32 dataHash, bytes memory signature)
        public
        view
        returns (bytes4 magicValue)
    {
        address recoveredAddress = dataHash.recover(signature);

        return (
            ERC725Y(_target).getPermissionsFor(recoveredAddress).hasPermission(_PERMISSION_SIGN)
                ? _ERC1271_MAGICVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(bytes calldata payload) public payable virtual returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(uint256[] calldata values, bytes[] calldata payloads)
        public
        payable
        virtual
        returns (bytes[] memory)
    {
        if (values.length != payloads.length) {
            revert BatchExecuteParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasLib.uncheckedIncrement(ii)) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _execute(values[ii], payloads[ii]);
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) public payable virtual returns (bytes memory) {
        return _executeRelayCall(signature, nonce, msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes[] memory signatures,
        uint256[] calldata nonces,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual returns (bytes[] memory) {
        if (
            signatures.length != nonces.length ||
            nonces.length != values.length ||
            values.length != payloads.length
        ) {
            revert BatchExecuteRelayCallParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ii = GasLib.uncheckedIncrement(ii)) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _executeRelayCall(signatures[ii], nonces[ii], values[ii], payloads[ii]);
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    function _execute(uint256 msgValue, bytes calldata payload)
        internal
        virtual
        returns (bytes memory)
    {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        _nonReentrantBefore(msg.sender);
        _verifyPermissions(msg.sender, payload);
        bytes memory result = _executePayload(msgValue, payload);
        _nonReentrantAfter();
        return result;
    }

    function _executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        bytes memory encodedMessage = abi.encodePacked(
            LSP6_VERSION,
            block.chainid,
            nonce,
            msgValue,
            payload
        );

        address signer = address(this).toDataWithIntendedValidator(encodedMessage).recover(
            signature
        );

        _nonReentrantBefore(signer);

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        _verifyPermissions(signer, payload);

        bytes memory result = _executePayload(msgValue, payload);

        _nonReentrantAfter();

        return result;
    }

    /**
     * @notice execute the `payload` passed to `execute(...)` or `executeRelayCall(...)`
     * @param payload the abi-encoded function call to execute on the target.
     * @return bytes the result from calling the target with `payload`
     */
    function _executePayload(uint256 msgValue, bytes calldata payload)
        internal
        virtual
        returns (bytes memory)
    {
        emit Executed(bytes4(payload), msgValue);

        (bool success, bytes memory returnData) = _target.call{value: msgValue, gas: gasleft()}(
            payload
        );
        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: failed executing payload"
        );

        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @notice verify the nonce `_idx` for `_from` (obtained via `getNonce(...)`)
     * @dev "idx" is a 256bits (unsigned) integer, where:
     *          - the 128 leftmost bits = channelId
     *      and - the 128 rightmost bits = nonce within the channel
     * @param from caller address
     * @param idx (channel id + nonce within the channel)
     */
    function _isValidNonce(address from, uint256 idx) internal view virtual returns (bool) {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (idx % (1 << 128)) == (_nonceStore[from][idx >> 128]);
    }

    /**
     * @dev verify if the `from` address is allowed to execute the `payload` on the `target`.
     * @param from either the caller of `execute(...)` or the signer of `executeRelayCall(...)`.
     * @param payload the payload to execute on the `target`.
     */
    function _verifyPermissions(address from, bytes calldata payload) internal view virtual {
        bytes32 permissions = ERC725Y(_target).getPermissionsFor(from);
        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        bytes4 erc725Function = bytes4(payload);

        // ERC725Y.setData(bytes32,bytes)
        if (erc725Function == SETDATA_SELECTOR) {
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(payload[4:], (bytes32, bytes));

            _verifyCanSetData(from, permissions, inputKey, inputValue);

            // ERC725Y.setData(bytes32[],bytes[])
        } else if (erc725Function == SETDATA_ARRAY_SELECTOR) {
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi.decode(
                payload[4:],
                (bytes32[], bytes[])
            );

            _verifyCanSetData(from, permissions, inputKeys, inputValues);

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == EXECUTE_SELECTOR) {
            _verifyCanExecute(from, permissions, payload);
        } else if (
            erc725Function == ILSP14Ownable2Step.transferOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.acceptOwnership.selector
        ) {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEOWNER);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set a data key on the ERC725Y storage of the `target`.
     * @param controllerAddress the address who want to set the data key.
     * @param controllerPermissions the permissions to be checked against.
     * @param inputDataKey the data key to set on the `target`.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     */
    function _verifyCanSetData(
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes memory inputDataValue
    ) internal view virtual {
        bytes32 requiredPermission = _getPermissionRequiredToSetDataKey(
            inputDataKey,
            inputDataValue
        );

        // CHECK if allowed to set an ERC725Y Data Key
        if (requiredPermission == _PERMISSION_SETDATA) {
            // Skip if caller has SUPER permissions
            if (controllerPermissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

            _requirePermissions(controllerAddress, controllerPermissions, _PERMISSION_SETDATA);

            _verifyAllowedERC725YSingleKey(
                controllerAddress,
                inputDataKey,
                ERC725Y(_target).getAllowedERC725YDataKeysFor(controllerAddress)
            );
        } else {
            // Otherwise CHECK the required permission if setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
            _requirePermissions(controllerAddress, controllerPermissions, requiredPermission);
        }
    }

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set an array of data keys on the ERC725Y storage of the `target`.
     * @param controllerAddress the address who want to set the data keys.
     * @param controllerPermissions the permissions to be checked against.
     * @param inputDataKeys an array of data keys to set on the `target`.
     * @param inputDataValues an array of data values to set for the `inputDataKeys`.
     */
    function _verifyCanSetData(
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes32[] memory inputDataKeys,
        bytes[] memory inputDataValues
    ) internal view virtual {
        bool isSettingERC725YKeys;
        bool[] memory validatedInputDataKeys = new bool[](inputDataKeys.length);

        bytes32 requiredPermission;

        uint256 ii;
        do {
            requiredPermission = _getPermissionRequiredToSetDataKey(
                inputDataKeys[ii],
                inputDataValues[ii]
            );

            if (requiredPermission == _PERMISSION_SETDATA) {
                isSettingERC725YKeys = true;
            } else {
                // CHECK the required permissions if setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
                _requirePermissions(controllerAddress, controllerPermissions, requiredPermission);
                validatedInputDataKeys[ii] = true;
            }

            ii = GasLib.uncheckedIncrement(ii);
        } while (ii < inputDataKeys.length);

        // CHECK if allowed to set one (or multiple) ERC725Y Data Keys
        if (isSettingERC725YKeys) {
            // Skip if caller has SUPER permissions
            if (controllerPermissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

            _requirePermissions(controllerAddress, controllerPermissions, _PERMISSION_SETDATA);

            _verifyAllowedERC725YDataKeys(
                controllerAddress,
                inputDataKeys,
                ERC725Y(_target).getAllowedERC725YDataKeysFor(controllerAddress),
                validatedInputDataKeys
            );
        }
    }

    /**
     * @dev retrieve the permission required based on the data key to be set on the `target`.
     * @param inputDataKey the data key to set on the `target`. Can be related to LSP6 Permissions, LSP1 Delegate or LSP17 Extensions.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     * @return the permission required to set the `inputDataKey` on the `target`.
     */
    function _getPermissionRequiredToSetDataKey(bytes32 inputDataKey, bytes memory inputDataValue)
        internal
        view
        virtual
        returns (bytes32)
    {
        // AddressPermissions[] or AddressPermissions[index]
        if (bytes16(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
            return _getPermissionToSetPermissionsArray(inputDataKey, inputDataValue);

            // AddressPermissions:...
        } else if (bytes6(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
            // AddressPermissions:Permissions:<address>
            if (bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {
                return _getPermissionToSetControllerPermissions(inputDataKey);

                // AddressPermissions:AllowedCalls:<address>
            } else if (bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX) {
                return _getPermissionToSetAllowedCalls(inputDataKey, inputDataValue);

                // AddressPermissions:AllowedERC725YKeys:<address>
            } else if (
                bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
            ) {
                return _getPermissionToSetAllowedERC725YDataKeys(inputDataKey, inputDataValue);

                // if the first 6 bytes of the input data key are "AddressPermissions:..." but did not match
                // with anything above, this is not a standard LSP6 permission data key so we revert.
            } else {
                /**
                 * @dev more permissions types starting with `AddressPermissions:...` can be implemented by overriding this function.
                 *
                 *      // AddressPermissions:MyCustomPermissions:<address>
                 *      bytes12 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba40000
                 *
                 *      if (bytes12(dataKey) == CUSTOM_PERMISSION_PREFIX) {
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
            return _getPermissionToSetLSP1Delegate(inputDataKey);

            // LSP17Extension:<bytes4>
        } else if (bytes12(inputDataKey) == _LSP17_EXTENSION_PREFIX) {
            return _getPermissionToSetLSP17Extension(inputDataKey);
        } else {
            return _PERMISSION_SETDATA;
        }
    }

    /**
     * @dev retrieve the permission required to update the `AddressPermissions[]` array data key defined in LSP6.
     * @param inputDataKey either `AddressPermissions[]` (array length) or `AddressPermissions[index]` (array index)
     * @param inputDataValue the updated value for the `inputDataKey`. MUST be:
     *  - a `uint256` for `AddressPermissions[]` (array length)
     *  - an `address` or `0x` for `AddressPermissions[index]` (array entry).
     *
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetPermissionsArray(bytes32 inputDataKey, bytes memory inputDataValue)
        internal
        view
        virtual
        returns (bytes32)
    {
        bytes memory currentValue = ERC725Y(_target).getData(inputDataKey);

        // AddressPermissions[] -> array length
        if (inputDataKey == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {
            uint256 newLength = uint256(bytes32(inputDataValue));

            return
                newLength > uint256(bytes32(currentValue))
                    ? _PERMISSION_ADDCONTROLLER
                    : _PERMISSION_CHANGEPERMISSIONS;
        }

        // AddressPermissions[index] -> array index

        // CHECK that we either ADD an address (20 bytes long) or REMOVE an address (0x)
        if (inputDataValue.length != 0 && inputDataValue.length != 20) {
            revert AddressPermissionArrayIndexValueNotAnAddress(inputDataKey, inputDataValue);
        }

        return currentValue.length == 0 ? _PERMISSION_ADDCONTROLLER : _PERMISSION_CHANGEPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to set permissions for a controller address.
     * @param inputPermissionDataKey `AddressPermissions:Permissions:<controller-address>`.
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetControllerPermissions(bytes32 inputPermissionDataKey)
        internal
        view
        virtual
        returns (bytes32)
    {
        return
            // if there is nothing stored under the data key, we are trying to ADD a new controller.
            // if there are already some permissions set under the data key, we are trying to CHANGE the permissions of a controller.
            bytes32(ERC725Y(_target).getData(inputPermissionDataKey)) == bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_CHANGEPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to set some AllowedCalls for a controller.
     * @param dataKey `AddressPermissions:AllowedCalls:<controller-address>`.
     * @param dataValue the updated value for the `dataKey`. MUST be a bytes28[CompactBytesArray] of Allowed Calls.
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetAllowedCalls(bytes32 dataKey, bytes memory dataValue)
        internal
        view
        virtual
        returns (bytes32)
    {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedCalls(dataValue)) {
            revert InvalidEncodedAllowedCalls(dataValue);
        }

        // if there is nothing stored under the Allowed Calls of the controller,
        // we are trying to ADD a list of restricted calls (standards + address + function selector)
        //
        // if there are already some data set under the Allowed Calls of the controller,
        // we are trying to CHANGE (= edit) these restrictions.
        return
            ERC725Y(_target).getData(dataKey).length == 0
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_CHANGEPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to set some AllowedCalls for a controller.
     * @param dataKey  or `AddressPermissions:AllowedERC725YDataKeys:<controller-address>`.
     * @param dataValue the updated value for the `dataKey`. MUST be a bytes[CompactBytesArray] of Allowed ERC725Y Data Keys.
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetAllowedERC725YDataKeys(bytes32 dataKey, bytes memory dataValue)
        internal
        view
        returns (bytes32)
    {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(dataValue)) {
            revert InvalidEncodedAllowedERC725YDataKeys(dataValue);
        }

        // if there is nothing stored under the Allowed ERC725Y Data Keys of the controller,
        // we are trying to ADD a list of restricted ERC725Y Data Keys.
        //
        // if there are already some data set under the Allowed ERC725Y Data Keys of the controller,
        // we are trying to CHANGE (= edit) these restricted ERC725Y data keys.
        return
            ERC725Y(_target).getData(dataKey).length == 0
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_CHANGEPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to either add or change the address
     * of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key.
     * @param lsp1DelegateDataKey either the data key for the default `LSP1UniversalReceiverDelegate`,
     * or a data key for a specific `LSP1UniversalReceiverDelegate:<typeId>`, starting with `_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX`.
     * @return either ADD or CHANGE UNIVERSALRECEIVERDELEGATE.
     */
    function _getPermissionToSetLSP1Delegate(bytes32 lsp1DelegateDataKey)
        internal
        view
        virtual
        returns (bytes32)
    {
        return
            ERC725Y(_target).getData(lsp1DelegateDataKey).length == 0
                ? _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE
                : _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE;
    }

    /**
     * @dev Verify if `from` has the required permissions to either add or change the address
     * of an LSP0 Extension stored under a specific LSP17Extension data key
     * @param lsp17ExtensionDataKey the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix.
     */
    function _getPermissionToSetLSP17Extension(bytes32 lsp17ExtensionDataKey)
        internal
        view
        virtual
        returns (bytes32)
    {
        return
            ERC725Y(_target).getData(lsp17ExtensionDataKey).length == 0
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

        if (!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted);

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓
         * 03 a00000
         * 05 fff83a0011
         * 20 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 12 bb000000000000000000000000000000beef
         * 19 cc00000000000000000000000000000000000000000000deed
         * ↑↑
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
         * 0x 03 a00000 03 fff83a 20 aa00...00cafe
         *    ↑↑        ↑↑        ↑↑
         *  first  |  second  |  third
         *  length |  length  |  length
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
                bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) <<
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
                let memoryAt := mload(add(allowedERC725YDataKeysCompacted, offset))
                // MLOAD loads 32 bytes word, so we need to keep only the `length` number of bytes that makes up the allowed data key.
                allowedKey := and(memoryAt, mask)
            }

            // voila you found the key ;)
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
     * @param validatedInputKeys an array of booleans to store the result of the verification of each data keys checked.
     */
    function _verifyAllowedERC725YDataKeys(
        address controllerAddress,
        bytes32[] memory inputDataKeys,
        bytes memory allowedERC725YDataKeysCompacted,
        bool[] memory validatedInputKeys
    ) internal pure virtual {
        if (allowedERC725YDataKeysCompacted.length == 0)
            revert NoERC725YDataKeysAllowed(controllerAddress);

        if (!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YDataKeysCompacted);

        uint256 allowedKeysFound;

        // cache the input data keys from the start
        uint256 inputKeysLength = inputDataKeys.length;

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓
         * 03 a00000
         * 05 fff83a0011
         * 20 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 12 bb000000000000000000000000000000beef
         * 19 cc00000000000000000000000000000000000000000000deed
         * ↑↑
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
         * 0x 03 a00000 03 fff83a 20 aa00...00cafe
         *    ↑↑        ↑↑        ↑↑
         *  first  |  second  |  third
         *  length |  length  |  length
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
                bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) <<
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
                let memoryAt := mload(add(allowedERC725YDataKeysCompacted, offset))
                allowedKey := and(memoryAt, mask)
            }

            /**
             * Iterate over the `inputDataKeys` to check them against the allowed data keys.
             * This until we have validated them all.
             */
            for (uint256 ii; ii < inputKeysLength; ii = GasLib.uncheckedIncrement(ii)) {
                // if the input data key has been marked as allowed previously,
                // SKIP it and move to the next input data key.
                if (validatedInputKeys[ii]) continue;

                // CHECK if the input data key is allowed.
                if ((inputDataKeys[ii] & mask) == allowedKey) {
                    // if the input data key is allowed, mark it as allowed
                    // and increment the number of allowed keys found.
                    validatedInputKeys[ii] = true;
                    allowedKeysFound = GasLib.uncheckedIncrement(allowedKeysFound);

                    // Continue checking until all the inputKeys` have been found.
                    if (allowedKeysFound == inputKeysLength) return;
                }
            }

            // Move the pointer to the next AllowedERC725YKey
            unchecked {
                pointer = pointer + (length + 2);
            }
        }

        // if we did not find all the input data keys, search for the first not allowed data key to revert.
        for (uint256 jj; jj < inputKeysLength; jj = GasLib.uncheckedIncrement(jj)) {
            if (!validatedInputKeys[jj]) {
                revert NotAllowedERC725YDataKey(controllerAddress, inputDataKeys[jj]);
            }
        }
    }

    /**
     * @dev verify if `from` has the required permissions to interact with other addresses using the target.
     * @param from the address who want to run the execute function on the ERC725Account
     * @param permissions the permissions of the caller
     * @param payload the ABI encoded payload `target.execute(...)`
     */
    function _verifyCanExecute(
        address from,
        bytes32 permissions,
        bytes calldata payload
    ) internal view virtual {
        // MUST be one of the ERC725X operation types.
        uint256 operationType = uint256(bytes32(payload[4:36]));

        // DELEGATECALL is disallowed by default on the LSP6 Key Manager.
        if (operationType == OPERATION_4_DELEGATECALL) {
            revert DelegateCallDisallowedViaKeyManager();
        }

        uint256 value = uint256(bytes32(payload[68:100]));

        // prettier-ignore
        bool isContractCreation = operationType == OPERATION_1_CREATE || operationType == OPERATION_2_CREATE2;
        bool isCallDataPresent = payload.length > 164;

        // SUPER operation only applies to contract call, not contract creation
        bool hasSuperOperation = isContractCreation
            ? false
            : permissions.hasPermission(_extractSuperPermissionFromOperation(operationType));

        // CHECK if we are doing an empty call, as the receive() or fallback() function
        // of the target contract could run some code.
        if (!hasSuperOperation && !isCallDataPresent && value == 0) {
            _requirePermissions(from, permissions, _extractPermissionFromOperation(operationType));
        }

        if (isCallDataPresent && !hasSuperOperation) {
            _requirePermissions(from, permissions, _extractPermissionFromOperation(operationType));
        }

        bool hasSuperTransferValue = permissions.hasPermission(_PERMISSION_SUPER_TRANSFERVALUE);

        if (value != 0 && !hasSuperTransferValue) {
            _requirePermissions(from, permissions, _PERMISSION_TRANSFERVALUE);
        }

        // Skip on contract creation (CREATE or CREATE2)
        if (isContractCreation) return;

        // Skip if caller has SUPER permissions for external calls, with or without calldata (empty calls)
        if (hasSuperOperation && value == 0) return;

        // Skip if caller has SUPER permission for value transfers
        if (hasSuperTransferValue && !isCallDataPresent && value != 0) return;

        // Skip if both SUPER permissions are present
        if (hasSuperOperation && hasSuperTransferValue) return;

        _verifyAllowedCall(from, payload);
    }

    function _verifyAllowedCall(address from, bytes calldata payload) internal view virtual {
        // CHECK for ALLOWED CALLS
        address to = address(bytes20(payload[48:68]));

        bool containsFunctionCall = payload.length >= 168;
        bytes4 selector;
        if (containsFunctionCall) selector = bytes4(payload[164:168]);

        bytes memory allowedCalls = ERC725Y(_target).getAllowedCallsFor(from);
        uint256 allowedCallsLength = allowedCalls.length;

        if (allowedCallsLength == 0 || !LSP6Utils.isCompactBytesArrayOfAllowedCalls(allowedCalls)) {
            revert NoCallsAllowed(from);
        }

        bool isAllowedStandard;
        bool isAllowedAddress;
        bool isAllowedFunction;

        for (uint256 ii; ii < allowedCallsLength; ii += 30) {
            bytes memory chunk = BytesLib.slice(allowedCalls, ii + 2, 28);

            if (bytes28(chunk) == 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
                revert InvalidWhitelistedCall(from);
            }

            bytes4 allowedStandard = bytes4(chunk);
            address allowedAddress = address(bytes20(bytes28(chunk) << 32));
            bytes4 allowedFunction = bytes4(bytes28(chunk) << 192);

            isAllowedStandard =
                allowedStandard == 0xffffffff ||
                to.supportsERC165InterfaceUnchecked(allowedStandard);
            isAllowedAddress =
                allowedAddress == 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF ||
                to == allowedAddress;
            isAllowedFunction =
                allowedFunction == 0xffffffff ||
                (containsFunctionCall && (selector == allowedFunction));

            if (isAllowedStandard && isAllowedAddress && isAllowedFunction) return;
        }

        revert NotAllowedCall(from, to, selector);
    }

    /**
     * @dev extract the required permission + a descriptive string, based on the `_operationType`
     * being run via ERC725Account.execute(...)
     * @param operationType 0 = CALL, 1 = CREATE, 2 = CREATE2, etc... See ERC725X docs for more infos.
     * @return permissionsRequired (bytes32) the permission associated with the `_operationType`
     */
    function _extractPermissionFromOperation(uint256 operationType)
        internal
        pure
        virtual
        returns (bytes32 permissionsRequired)
    {
        if (operationType == OPERATION_0_CALL) return _PERMISSION_CALL;
        else if (operationType == OPERATION_1_CREATE) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_2_CREATE2) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_3_STATICCALL) return _PERMISSION_STATICCALL;
        else if (operationType == OPERATION_4_DELEGATECALL) return _PERMISSION_DELEGATECALL;
    }

    /**
     * @dev returns the `superPermission` needed for a specific `operationType` of the `execute(..)`
     */
    function _extractSuperPermissionFromOperation(uint256 operationType)
        internal
        pure
        virtual
        returns (bytes32 superPermission)
    {
        if (operationType == OPERATION_0_CALL) return _PERMISSION_SUPER_CALL;
        else if (operationType == OPERATION_3_STATICCALL) return _PERMISSION_SUPER_STATICCALL;
        else if (operationType == OPERATION_4_DELEGATECALL) return _PERMISSION_SUPER_DELEGATECALL;
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
    ) internal pure virtual {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = _getPermissionName(permissionRequired);
            revert NotAuthorised(from, permissionErrorString);
        }
    }

    /**
     * @dev returns the name of the permission as a string
     */
    function _getPermissionName(bytes32 permission)
        internal
        pure
        virtual
        returns (string memory errorMessage)
    {
        if (permission == _PERMISSION_CHANGEOWNER) return "TRANSFEROWNERSHIP";
        if (permission == _PERMISSION_CHANGEPERMISSIONS) return "CHANGEPERMISSIONS";
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

    /**
     * @dev Initialise _reentrancyStatus to _NOT_ENTERED.
     */
    function _setupLSP6ReentrancyGuard() internal virtual {
        _reentrancyStatus = false;
    }

    /**
     * @dev Update the status from `_NON_ENTERED` to `_ENTERED` and checks if
     * the status is `_ENTERED` in order to revert the call unless the caller has the REENTRANCY permission
     * Used in the beginning of the `nonReentrant` modifier, before the method execution starts.
     */
    function _nonReentrantBefore(address from) internal virtual {
        if (_reentrancyStatus) {
            // CHECK the caller has REENTRANCY permission
            _requirePermissions(
                from,
                ERC725Y(_target).getPermissionsFor(from),
                _PERMISSION_REENTRANCY
            );
        } else {
            _reentrancyStatus = true;
        }
    }

    /**
     * @dev Resets the status to `_NOT_ENTERED`
     * Used in the end of the `nonReentrant` modifier after the method execution is terminated
     */
    function _nonReentrantAfter() internal virtual {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus = false;
    }
}
