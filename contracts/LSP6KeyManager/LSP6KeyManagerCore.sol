// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import {GasLib} from "../Utils/GasLib.sol";
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
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
 * @title Core implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerCore is ERC165, ILSP6KeyManager {
    using LSP2Utils for *;
    using LSP6Utils for *;
    using Address for address;
    using ECDSA for bytes32;
    using ERC165Checker for address;
    using EIP191Signer for address;
    using BytesLib for bytes;

    // Variables, methods and modifier which are used for ReentrancyGuard
    // are taken from the link below and modified according to our needs.
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.8/contracts/security/ReentrancyGuard.sol
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _reentrancyStatus;

    address public target;
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

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
            ERC725Y(target).getPermissionsFor(recoveredAddress).hasPermission(_PERMISSION_SIGN)
                ? _ERC1271_MAGICVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(bytes calldata payload) public payable returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(uint256[] calldata values, bytes[] calldata payloads)
        public
        payable
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
    ) public payable returns (bytes memory) {
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
    ) public payable returns (bytes[] memory) {
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

    function _execute(uint256 msgValue, bytes calldata payload) internal returns (bytes memory) {
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
    ) internal returns (bytes memory) {
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
     * @notice execute the received payload (obtained via `execute(...)` and `executeRelayCall(...)`)
     *
     * @param payload the payload to execute
     * @return bytes the result from calling the target with `_payload`
     */
    function _executePayload(uint256 msgValue, bytes calldata payload)
        internal
        returns (bytes memory)
    {
        emit Executed(bytes4(payload), msgValue);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = target.call{value: msgValue, gas: gasleft()}(
            payload
        );
        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: fail executing payload"
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
    function _isValidNonce(address from, uint256 idx) internal view returns (bool) {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (idx % (1 << 128)) == (_nonceStore[from][idx >> 128]);
    }

    /**
     * @dev verify the permissions of the _from address that want to interact with the `target`
     * @param from the address making the request
     * @param payload the payload that will be run on `target`
     */
    function _verifyPermissions(address from, bytes calldata payload) internal view {
        bytes4 erc725Function = bytes4(payload);

        // retrieve the permissions of the caller
        bytes32 permissions = ERC725Y(target).getPermissionsFor(from);

        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        // ERC725Y.setData(bytes32,bytes)
        if (erc725Function == SETDATA_SELECTOR) {
            _verifyCanSetData({
                controllerAddress: from,
                controllerPermissions: permissions,
                inputDataKey: bytes32(payload[4:]),
                // we always extract both the [length][value] from the inputDataValue
                //  - [length] = payload[68:100]
                //  - [value] = payload[100:] (until the end of the calldata)
                // this enables to check the length of the value provided in future checks
                // e.g: if inputDataKey == 0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000001 (AddressPermissions[index]),
                // inputDataValue should be a 20 bytes long address, so [length] should be 0x14 (= 20)
                inputDataValue: payload[68:]
            });

            // ERC725Y.setData(bytes32[],bytes[])
        } else if (erc725Function == SETDATA_ARRAY_SELECTOR) {
            uint256 dataKeysArrayOffset = 4 + uint256(bytes32(payload[4:]));
            uint256 dataValuesArrayOffset = 4 + uint256(bytes32(payload[36:]));

            _verifyCanSetData({
                controllerAddress: from,
                controllerPermissions: permissions,
                inputDataKeys: payload[dataKeysArrayOffset:dataValuesArrayOffset],
                inputDataValues: payload[dataValuesArrayOffset:]
            });

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == EXECUTE_SELECTOR) {
            _verifyCanExecute(from, permissions, payload);
        } else if (
            erc725Function == OwnableUnset.transferOwnership.selector ||
            erc725Function == LSP14Ownable2Step.acceptOwnership.selector
        ) {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEOWNER);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    function _verifyCanSetData(
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes calldata inputDataValue
    ) internal view {
        // AddressPermissions[] or AddressPermissions[index]
        if (bytes16(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
            _verifyCanSetPermissionsArray(
                controllerAddress,
                controllerPermissions,
                inputDataKey,
                inputDataValue
            );

            // AddressPermissions:Permissions:<address>
        } else if (bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {
            _verifyCanSetPermissions(controllerAddress, controllerPermissions, inputDataKey);
        } else if (
            // AddressPermissions:AllowedCalls:<address>
            bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX ||
            // AddressPermissions:AllowedERC725YKeys:<address>
            bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
        ) {
            _verifyCanSetAllowedCallsOrERC725YKeys(
                controllerAddress,
                controllerPermissions,
                inputDataKey,
                inputDataValue
            );
        } else if (
            // LSP1UniversalReceiverDelegate
            inputDataKey == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
            // or LSP1UniversalReceiverDelegate:<typeId>
            bytes12(inputDataKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
        ) {
            _verifyCanSetUniversalReceiverDelegateKey(
                controllerAddress,
                controllerPermissions,
                inputDataKey
            );

            // if the first 6 bytes of the input data key are "AddressPermissions:..." but did not match
            // with anything above, this is not a standard LSP6 permission data key so we revert
        } else if (bytes6(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
            /**
             * @dev to implement custom permissions dataKeys, consider overriding
             * this function and implement specific checks
             *
             *      // AddressPermissions:MyCustomPermissions:<address>
             *      bytes12 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba40000
             *
             *      if (bytes12(dataKey) == CUSTOM_PERMISSION_PREFIX) {
             *          // custom logic
             *      }
             *      super._verifyCanSetPermissions(...)
             */
            revert NotRecognisedPermissionKey(inputDataKey);

            // if regular ERC725Y data key
        } else {
            _verifyCanSetERC725YDataKey(controllerAddress, controllerPermissions, inputDataKey);
        }
    }

    function _verifyCanSetData(
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes calldata inputDataKeys,
        bytes calldata inputDataValues
    ) internal view {
        uint256 numberOfDataKeysValuePairs = uint256(bytes32(inputDataKeys[:32]));

        bool isSettingERC725YKeys;

        bool[] memory validatedInputDataKeys = new bool[](numberOfDataKeysValuePairs);

        for (uint256 ii = 1; ii <= numberOfDataKeysValuePairs; ii = GasLib.uncheckedIncrement(ii)) {
            // for performance reasons, we do not specify the ending offset.
            // we only specify the starting offset since we only load 32 bytes words at a time
            // and the CALLDATALOAD opcode does that by default.
            uint256 startOffset = 32 * ii;
            bytes32 inputDataKey = bytes32(inputDataKeys[startOffset:]);

            bytes calldata inputDataValue;
            // create a new block scope to maintain the number of items on the EVM stack to a minimum.
            {
                // '32' corresponds to the length of dataValuesArray. The offsets for each inputDataValue start on the next 32 bytes word
                uint256 inputDataValueOffset = 32 + uint256(bytes32(inputDataValues[startOffset:]));
                uint256 inputDataValueLength = uint256(
                    bytes32(inputDataValues[inputDataValueOffset:])
                );
                inputDataValue = inputDataValues[inputDataValueOffset:inputDataValueOffset +
                    32 +
                    inputDataValueLength];

                // The local variables can be removed from the stack at the end of the block scope,
                // since we do not reuse them afterwards.
            }

            // AddressPermissions[] or AddressPermissions[index]
            if (bytes16(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
                _verifyCanSetPermissionsArray(
                    controllerAddress,
                    controllerPermissions,
                    inputDataKey,
                    inputDataValue
                );
                validatedInputDataKeys[ii - 1] = true;

                // AddressPermissions:Permissions:<address>
            } else if (bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {
                _verifyCanSetPermissions(controllerAddress, controllerPermissions, inputDataKey);
                validatedInputDataKeys[ii - 1] = true;
            } else if (
                // AddressPermissions:AllowedCalls:<address>
                bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX ||
                // AddressPermissions:AllowedERC725YKeys:<address>
                bytes12(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
            ) {
                _verifyCanSetAllowedCallsOrERC725YKeys(
                    controllerAddress,
                    controllerPermissions,
                    inputDataKey,
                    inputDataValue
                );
                validatedInputDataKeys[ii - 1] = true;
            } else if (
                // LSP1UniversalReceiverDelegate
                inputDataKey == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
                // or LSP1UniversalReceiverDelegate:<typeId>
                bytes12(inputDataKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
            ) {
                _verifyCanSetUniversalReceiverDelegateKey(
                    controllerAddress,
                    controllerPermissions,
                    inputDataKey
                );
                validatedInputDataKeys[ii - 1] = true;

                // if the first 6 bytes of the input data key are "AddressPermissions:..." but did not match
                // with anything above, this is not a standard LSP6 permission data key so we revert
            } else if (bytes6(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
                /**
                 * @dev to implement custom permissions dataKeys, consider overriding
                 * this function and implement specific checks
                 *
                 *      // AddressPermissions:MyCustomPermissions:<address>
                 *      bytes12 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba40000
                 *
                 *      if (bytes12(dataKey) == CUSTOM_PERMISSION_PREFIX) {
                 *          // custom logic
                 *      }
                 *      super._verifyCanSetPermissions(...)
                 */
                revert NotRecognisedPermissionKey(inputDataKey);

                // if regular ERC725Y data key
            } else {
                isSettingERC725YKeys = true;
            }
        }

        if (isSettingERC725YKeys) {
            // Skip if caller has SUPER permissions
            if (controllerPermissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

            _requirePermissions(controllerAddress, controllerPermissions, _PERMISSION_SETDATA);

            _verifyAllowedERC725YDataKeys(
                controllerAddress,
                inputDataKeys,
                ERC725Y(target).getAllowedERC725YDataKeysFor(controllerAddress),
                validatedInputDataKeys
            );
        }
    }

    function _verifyCanSetPermissionsArray(
        address from,
        bytes32 permissions,
        bytes32 inputDataKey,
        bytes calldata inputDataValue
    ) internal view {
        bytes memory currentValue = ERC725Y(target).getData(inputDataKey);

        // AddressPermissions[] -> array length
        if (inputDataKey == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {
            uint256 newLength = uint256(bytes32(inputDataValue[32:]));

            if (newLength > uint256(bytes32(currentValue))) {
                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
            } else {
                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
            }

            return;
        }

        // AddressPermissions[index] -> array index
        if (currentValue.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
        }

        // bytes are always made of [length][value]
        // extract the first 32 bytes word to know the length (= number of bytes)
        uint256 inputDataValueLength = uint256(bytes32(inputDataValue[:32]));

        // CHECK that we either:
        //  - ADD an address (20 bytes long)
        //  - REMOVE an address (0x)
        if (inputDataValueLength != 0 && inputDataValueLength != 20) {
            revert AddressPermissionArrayIndexValueNotAnAddress(
                inputDataKey,
                inputDataValue[32:(32 + inputDataValueLength)]
            );
        }
    }

    function _verifyCanSetPermissions(
        address from,
        bytes32 permissions,
        bytes32 inputPermissionDataKey
    ) internal view virtual {
        if (bytes32(ERC725Y(target).getData(inputPermissionDataKey)) == bytes32(0)) {
            // if there is nothing stored under this data dataKey,
            // we are trying to ADD permissions for a NEW address
            _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            // if there are already some permissions stored under this data dataKey,
            // we are trying to CHANGE the permissions of an address
            // (that has already some EXISTING permissions set)
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
        }
    }

    function _verifyCanSetAllowedCallsOrERC725YKeys(
        address from,
        bytes32 permissions,
        bytes32 dataKey,
        bytes calldata dataValue
    ) internal view {
        uint256 dataValueLength = uint256(bytes32(dataValue[:32]));
        bool isEmptyArray = dataValueLength == 0;

        if (!isEmptyArray && !LSP2Utils.isCompactBytesArray(dataValue[32:32 + dataValueLength])) {
            if (bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX) {
                revert InvalidEncodedAllowedCalls(dataValue[32:32 + dataValueLength]);
            } else {
                revert InvalidEncodedAllowedERC725YDataKeys(dataValue[32:32 + dataValueLength]);
            }
        }

        bytes memory storedAllowedValues = ERC725Y(target).getData(dataKey);

        if (storedAllowedValues.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
        }
    }

    function _verifyCanSetUniversalReceiverDelegateKey(
        address from,
        bytes32 permissions,
        bytes32 lsp1DelegateDataKey
    ) internal view {
        bytes memory dataValue = ERC725Y(target).getData(lsp1DelegateDataKey);

        if (dataValue.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE);
        }
    }

    /// TODO: implement in the logic of checking the inputDataKey prefix
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
        bytes32 permissions
    ) internal view {
        bytes memory dataValue = ERC725Y(target).getData(lsp17ExtensionDataKey);

        if (dataValue.length == 0) {
            _requirePermissions(from, permissions, _PERMISSION_ADDEXTENSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEEXTENSIONS);
        }
    }

    function _verifyCanSetERC725YDataKey(
        address from,
        bytes32 permissions,
        bytes32 inputDataKey
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        bytes memory allowedERC725YKeysCompacted = ERC725Y(target).getAllowedERC725YDataKeysFor(
            from
        );
        _verifyAllowedERC725YSingleKey(from, inputDataKey, allowedERC725YKeysCompacted);
    }

    /**
     * @dev Verify if the `inputKey` is present in `allowedERC725KeysCompacted` stored on the `from`'s ERC725Y contract
     */
    function _verifyAllowedERC725YSingleKey(
        address from,
        bytes32 inputKey,
        bytes memory allowedERC725YKeysCompacted
    ) internal pure {
        if (allowedERC725YKeysCompacted.length == 0) revert NoERC725YDataKeysAllowed(from);
        if (!LSP2Utils.isCompactBytesArray(allowedERC725YKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YKeysCompacted);

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
        while (pointer < allowedERC725YKeysCompacted.length) {
            /**
             * save the length of the following allowed key
             * which is saved in `allowedERC725YKeys[pointer]`
             */
            uint256 length = uint256(uint8(bytes1(allowedERC725YKeysCompacted[pointer])));

            /*
             * transform the allowed key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 allowedKey = bytes32(allowedERC725YKeysCompacted.slice(pointer + 1, length));

            /**
             * the bitmask discard the last `32 - length` bytes of the input key via ANDing &
             * so to compare only the relevant parts of each ERC725Y keys
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
                pointer += GasLib.uncheckedIncrement(length);
            }
        }

        revert NotAllowedERC725YDataKey(from, inputKey);
    }

    function _verifyAllowedERC725YDataKeys(
        address from,
        bytes calldata inputKeys,
        bytes memory allowedERC725YKeysCompacted,
        bool[] memory validatedInputKeys
    ) internal pure {
        if (allowedERC725YKeysCompacted.length == 0) revert NoERC725YDataKeysAllowed(from);
        if (!LSP2Utils.isCompactBytesArray(allowedERC725YKeysCompacted))
            revert InvalidEncodedAllowedERC725YDataKeys(allowedERC725YKeysCompacted);

        uint256 allowedKeysFound;

        // cache the input data keys from the start
        uint256 inputKeysLength = uint256(bytes32(inputKeys[:32]));

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
        while (allowedKeysFound < inputKeysLength && pointer < allowedERC725YKeysCompacted.length) {
            /**
             * save the length of the following allowed key
             * which is saved in `allowedERC725YKeys[pointer]`
             */
            uint256 length = uint256(uint8(bytes1(allowedERC725YKeysCompacted[pointer])));

            /*
             * transform the allowed key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            bytes32 allowedKey = bytes32(allowedERC725YKeysCompacted.slice(pointer + 1, length));

            /**
             * the bitmask discard the last `32 - length` bytes of the input key via ANDing &
             * so to compare only the relevant parts of each ERC725Y keys
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
            // iterate over the `inputKeys` to validate them
            for (uint256 ii = 0; ii < inputKeysLength; ii = GasLib.uncheckedIncrement(ii)) {
                // if the input data key has been marked as allowed previously,
                // SKIP it and move to the next input data key.
                if (validatedInputKeys[ii]) continue;

                // CHECK if the input data key is allowed
                if ((bytes32(inputKeys[32 + (32 * ii):]) & mask) == allowedKey) {
                    // if the input data key is allowed, mark it as allowed.
                    validatedInputKeys[ii] = true;
                    allowedKeysFound++;
                }
            }

            /**
             * Check wether all the `inputKeys` were found and return
             * Otherwise move to the next AllowedERC725YKey
             */
            if (allowedKeysFound == inputKeysLength) {
                return;
            } else {
                // move the pointer to the next AllowedERC725YKey
                pointer += GasLib.uncheckedIncrement(length);
            }
        }

        /**
         * Iterate over the `inputKeys` in order to find first not allowed ERC725Y key and revert
         */
        for (uint256 jj = 0; jj < inputKeysLength; jj = GasLib.uncheckedIncrement(jj)) {
            if (!validatedInputKeys[jj]) {
                revert NotAllowedERC725YDataKey(from, bytes32(inputKeys[32 + (32 * jj):]));
            }
        }
    }

    /**
     * @dev verify if `from` has the required permissions to make an external call
     * via the linked target
     * @param from the address who want to run the execute function on the ERC725Account
     * @param permissions the permissions of the caller
     * @param payload the ABI encoded payload `target.execute(...)`
     */
    function _verifyCanExecute(
        address from,
        bytes32 permissions,
        bytes calldata payload
    ) internal view {
        // MUST be one of the ERC725X operation types allowed
        // except DELEGATECALL (disallowed by default on the LSP6 Key Manager)
        uint256 operationType = uint256(bytes32(payload[4:36]));

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

        if (isCallDataPresent && !hasSuperOperation) {
            _requirePermissions(from, permissions, _extractPermissionFromOperation(operationType));
        }

        bool hasSuperTransferValue = permissions.hasPermission(_PERMISSION_SUPER_TRANSFERVALUE);

        if (value != 0 && !hasSuperTransferValue) {
            _requirePermissions(from, permissions, _PERMISSION_TRANSFERVALUE);
        }

        // Skip on contract creation (CREATE or CREATE2)
        if (isContractCreation) return;

        // Skip if caller has SUPER permissions for operations
        if (hasSuperOperation && isCallDataPresent && value == 0) return;

        // Skip if caller has SUPER permission for value transfers
        if (hasSuperTransferValue && !isCallDataPresent && value != 0) return;

        // Skip if both SUPER permissions are present
        if (hasSuperOperation && hasSuperTransferValue) return;

        _verifyAllowedCall(from, payload);
    }

    function _verifyAllowedCall(address from, bytes calldata payload) internal view {
        // CHECK for ALLOWED CALLS
        address to = address(bytes20(payload[48:68]));

        bool containsFunctionCall = payload.length >= 168;
        bytes4 selector;
        if (containsFunctionCall) selector = bytes4(payload[164:168]);

        bytes memory allowedCalls = ERC725Y(target).getAllowedCallsFor(from);
        uint256 allowedCallsLength = allowedCalls.length;

        if (allowedCallsLength == 0 || !LSP2Utils.isCompactBytesArray(allowedCalls)) {
            revert NoCallsAllowed(from);
        }

        bool isAllowedStandard;
        bool isAllowedAddress;
        bool isAllowedFunction;

        for (uint256 ii = 0; ii < allowedCallsLength; ii += 29) {
            bytes memory chunk = BytesLib.slice(allowedCalls, ii + 1, 28);

            if (bytes28(chunk) == 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
                revert InvalidWhitelistedCall(from);
            }

            bytes4 allowedStandard = bytes4(chunk);
            address allowedAddress = address(bytes20(bytes28(chunk) << 32));
            bytes4 allowedFunction = bytes4(bytes28(chunk) << 192);

            isAllowedStandard =
                allowedStandard == 0xffffffff ||
                to.supportsERC165Interface(allowedStandard);
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
        returns (bytes32 superPermission)
    {
        if (operationType == OPERATION_0_CALL) return _PERMISSION_SUPER_CALL;
        else if (operationType == OPERATION_3_STATICCALL) return _PERMISSION_SUPER_STATICCALL;
        else if (operationType == OPERATION_4_DELEGATECALL) return _PERMISSION_SUPER_DELEGATECALL;
    }

    /**
     * @dev return the number of zero bytes (0x00) appended at the end of `dataKey`.
     * e.g: for `dataKey` = 0xffffffffffffffff000000000000000000000000000000000000000000000000
     *      the function will return 24
     * @return the number of trailing zero bytes
     */
    function _countTrailingZeroBytes(bytes32 dataKey) internal pure returns (uint256) {
        uint256 nByte = 32;

        // CHECK each bytes of the data key, starting from the end (right to left)
        // skip each empty bytes `0x00` until we find the first non-empty byte
        while (nByte > 0 && dataKey[nByte - 1] == 0x00) nByte--;

        return 32 - nByte;
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
    ) internal pure {
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
        returns (string memory errorMessage)
    {
        if (permission == _PERMISSION_CHANGEOWNER) return "TRANSFEROWNERSHIP";
        if (permission == _PERMISSION_CHANGEPERMISSIONS) return "CHANGEPERMISSIONS";
        if (permission == _PERMISSION_ADDPERMISSIONS) return "ADDPERMISSIONS";
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
    function _setupLSP6ReentrancyGuard() internal {
        _reentrancyStatus = _NOT_ENTERED;
    }

    /**
     * @dev Update the status from `_NON_ENTERED` to `_ENTERED` and checks if
     * the status is `_ENTERED` in order to revert the call unless the caller has the REENTRANCY permission
     * Used in the beginning of the `nonReentrant` modifier, before the method execution starts
     */
    function _nonReentrantBefore(address from) private {
        if (_reentrancyStatus == _ENTERED) {
            // CHECK the caller has REENTRANCY permission
            bytes32 callerPermissions = ERC725Y(target).getPermissionsFor(from);
            _requirePermissions(from, callerPermissions, _PERMISSION_REENTRANCY);
        }

        _reentrancyStatus = _ENTERED;
    }

    /**
     * @dev Resets the status to `_NOT_ENTERED`
     * Used in the end of the `nonReentrant` modifier after the method execution is terminated
     */
    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus = _NOT_ENTERED;
    }
}
