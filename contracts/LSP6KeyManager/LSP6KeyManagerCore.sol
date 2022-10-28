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
    // ERC725X
    OPERATION_CALL,
    OPERATION_CREATE,
    OPERATION_CREATE2,
    OPERATION_STATICCALL,
    OPERATION_DELEGATECALL,
    // ERC725Y
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";
import "./LSP6Constants.sol";

import "hardhat/console.sol";

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
        _verifyPermissions(msg.sender, payload);

        return _executePayload(payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) public payable returns (bytes memory) {
        bytes memory encodedMessage = abi.encodePacked(
            LSP6_VERSION,
            block.chainid,
            nonce,
            msg.value,
            payload
        );

        address signer = address(this).toDataWithIntendedValidator(encodedMessage).recover(signature);

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        _verifyPermissions(signer, payload);

        return _executePayload(payload);
    }


     /**
      * @notice execute the received payload (obtained via `execute(...)` and `executeRelayCall(...)`)
      *
      * @param payload the payload to execute
      * @return bytes the result from calling the target with `_payload`
      */
     function _executePayload(bytes calldata payload) internal returns (bytes memory) {

        emit Executed(msg.value, bytes4(payload));

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory returnData) = target.call{value: msg.value, gas: gasleft()}(
            payload
        );
        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: Unknown Error occured when calling the linked target contract"
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
        bytes4 erc725Function = bytes4(payload[:4]);

        // get the permissions of the caller
        bytes32 permissions = ERC725Y(target).getPermissionsFor(from);

        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        if (erc725Function == SETDATA_SELECTOR) {
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(payload[4:], (bytes32, bytes));

            if (bytes16(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
                // CHECK if key = AddressPermissions[] or AddressPermissions[index]
                _verifyCanSetPermissionsArray(inputKey, inputValue, from, permissions);

            } else if (bytes6(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
                // CHECK for permission keys
                _verifyCanSetPermissions(inputKey, inputValue, from, permissions);

            } else {
                _verifyCanSetData(from, permissions, inputKey);
            }
        } else if (erc725Function == SETDATA_ARRAY_SELECTOR) {
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi.decode(
                payload[4:],
                (bytes32[], bytes[])
            );

            bool isSettingERC725YKeys = false;

            // loop through each ERC725Y data keys
            for (uint256 ii = 0; ii < inputKeys.length; ii = GasLib.uncheckedIncrement(ii)) {
                bytes32 key = inputKeys[ii];
                bytes memory value = inputValues[ii];

                if (bytes16(key) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
                    // CHECK if key = AddressPermissions[] or AddressPermissions[index]
                    _verifyCanSetPermissionsArray(key, value, from, permissions);

                    // "nullify" permission keys to not check them against allowed ERC725Y keys
                    inputKeys[ii] = bytes32(0);

                } else if (bytes6(key) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
                    // CHECK for permissions keys
                    _verifyCanSetPermissions(key, value, from, permissions);

                    // "nullify" permission keys to not check them against allowed ERC725Y keys
                    inputKeys[ii] = bytes32(0);
                } else {
                    // if the key is any other bytes32 key
                    isSettingERC725YKeys = true;
                }
            }

            if (isSettingERC725YKeys) {
                _verifyCanSetData(from, permissions, inputKeys);
            }
        } else if (erc725Function == IERC725X.execute.selector) {
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

    /**
     * @dev verify if `_from` has the required permissions to set some dataKeys on the linked target
     * @param from the address who want to set the dataKeys
     * @param permissions the permissions
     * @param inputKey the dataKey being set
     */
    function _verifyCanSetData(
        address from,
        bytes32 permissions,
        bytes32 inputKey
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        bytes memory allowedERC725YKeysCompacted = ERC725Y(target).getAllowedERC725YKeysFor(from);
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
        bytes32[] memory inputKeys
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        bytes memory allowedERC725YKeysCompacted = ERC725Y(target).getAllowedERC725YKeysFor(from);
        _verifyAllowedERC725YKeys(from, inputKeys, allowedERC725YKeysCompacted);
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
        bytes32 permissions
    ) internal view virtual {
        if (bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {

            // AddressPermissions:Permissions:<address>
            _verifyCanSetBytes32Permissions(dataKey, from, permissions);

        } else if (
            // AddressPermissions:AllowedCalls:<address>
            bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX ||
            // AddressPermissions:AllowedERC725YKeys:<address>
            bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDERC725YKEYS_PREFIX
        ) {

            bool isClearingArray = dataValue.length == 0;
            
            if (!isClearingArray && !LSP2Utils.isCompactBytesArray(dataValue)) {
                if (bytes12(dataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX) {
                    revert InvalidEncodedAllowedCalls(dataValue);
                } else {
                    revert InvalidEncodedAllowedERC725YKeys(dataValue);
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
             *      bytes12 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba40000
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
        bytes32 callerPermissions
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
        bytes32 permissions
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
     * @dev Verify if the `inputKey` is present in `allowedERC725KeysCompacted` stored on the `from`'s ERC725Y contract
     */
    function _verifyAllowedERC725YSingleKey(address from, bytes32 inputKey, bytes memory allowedERC725YKeysCompacted) internal pure {
        if (allowedERC725YKeysCompacted.length == 0) revert NoERC725YDataKeysAllowed(from);
        if (!LSP2Utils.isCompactBytesArray(allowedERC725YKeysCompacted)) revert InvalidEncodedAllowedERC725YKeys(allowedERC725YKeysCompacted);

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
            bytes32 allowedKey = bytes32(allowedERC725YKeysCompacted.slice(
                pointer + 1,
                length
            ));

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
                // move the pointer to the first index of the first fixed key
                pointer += length + 1;
            }
        }

        revert NotAllowedERC725YKey(from, inputKey);
    }

    /**
     * @dev verify if `from` is allowed to change the `inputKey`
     * @param from the address who want to set the dataKeys
     * @param inputKeys the dataKey that is verified
     */
    function _verifyAllowedERC725YKeys(address from, bytes32[] memory inputKeys, bytes memory allowedERC725YKeysCompacted) internal pure {
        for (uint256 i = 0; i < inputKeys.length; i++) {
            _verifyAllowedERC725YSingleKey(from, inputKeys[i], allowedERC725YKeysCompacted);
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
        uint256 operationType = uint256(bytes32(payload[4:36]));
        require(operationType < 5, "LSP6KeyManager: invalid operation type");

        require(
            operationType != OPERATION_DELEGATECALL,
            "LSP6KeyManager: operation DELEGATECALL is currently disallowed"
        );

        uint256 value = uint256(bytes32(payload[68:100]));

        // prettier-ignore
        bool isContractCreation = operationType == OPERATION_CREATE || operationType == OPERATION_CREATE2;
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
        bytes memory allowedCalls = ERC725Y(target).getAllowedCallsFor(from);

        bool containsFunctionCall = payload.length >= 168;
        bytes4 selector;

        if (containsFunctionCall) selector = bytes4(payload[164:168]);

        uint256 allowedCallsLength = allowedCalls.length;

        // TODO: change behaviour to disallow if nothing is set
        // if nothing set or not properly , whitelist everything
        if (allowedCallsLength == 0 || !LSP2Utils.isCompactBytesArray(allowedCalls)) return;

        bool isAllowedStandard;
        bool isAllowedAddress;
        bool isAllowedFunction;

        for (uint256 ii = 0; ii < allowedCallsLength; ii += 29) {

            bytes memory chunk = BytesLib.slice(allowedCalls, ii + 1, 28);

            bytes4 allowedStandard = bytes4(chunk);
            address allowedAddress = address(bytes20(bytes28(chunk) << 32));
            bytes4 allowedFunction = bytes4(bytes28(chunk) << 192);

            isAllowedStandard = allowedStandard == bytes4(type(uint32).max) || to.supportsERC165Interface(allowedStandard);
            isAllowedAddress = allowedAddress == address(bytes20(type(uint160).max)) || to == allowedAddress;
            isAllowedFunction = allowedFunction == bytes4(type(uint32).max) || containsFunctionCall && (selector == allowedFunction);

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
        if (operationType == OPERATION_CALL) return _PERMISSION_CALL;
        else if (operationType == OPERATION_CREATE) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_CREATE2) return _PERMISSION_DEPLOY;
        else if (operationType == OPERATION_STATICCALL) return _PERMISSION_STATICCALL;
        else if (operationType == OPERATION_DELEGATECALL) return _PERMISSION_DELEGATECALL;
    }

    /**
     * @dev returns the `superPermission` needed for a specific `operationType` of the `execute(..)`
     */
    function _extractSuperPermissionFromOperation(uint256 operationType)
        internal
        pure
        returns (bytes32 superPermission)
    {
        if (operationType == OPERATION_CALL) return _PERMISSION_SUPER_CALL;
        else if (operationType == OPERATION_STATICCALL) return _PERMISSION_SUPER_STATICCALL;
        else if (operationType == OPERATION_DELEGATECALL) return _PERMISSION_SUPER_DELEGATECALL;
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
        if (permission == _PERMISSION_SETDATA) return "SETDATA";
        if (permission == _PERMISSION_CALL) return "CALL";
        if (permission == _PERMISSION_STATICCALL) return "STATICCALL";
        if (permission == _PERMISSION_DELEGATECALL) return "DELEGATECALL";
        if (permission == _PERMISSION_DEPLOY) return "DEPLOY";
        if (permission == _PERMISSION_TRANSFERVALUE) return "TRANSFERVALUE";
        if (permission == _PERMISSION_SIGN) return "SIGN";
    }


}
