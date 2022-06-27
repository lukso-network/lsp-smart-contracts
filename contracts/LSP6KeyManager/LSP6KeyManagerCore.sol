// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// modules
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {IClaimOwnership} from "../Custom/IClaimOwnership.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ErrorHandlerLib} from "@erc725/smart-contracts/contracts/utils/ErrorHandlerLib.sol";
import {ERC165Checker} from "../Custom/ERC165Checker.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {LSP6Utils} from "./LSP6Utils.sol";

// errors
import "./LSP6Errors.sol";

// constants
// prettier-ignore
import {
    OPERATION_CALL,
    OPERATION_CREATE,
    OPERATION_CREATE2,
    OPERATION_STATICCALL,
    OPERATION_DELEGATECALL
} from "@erc725/smart-contracts/contracts/constants.sol";
import {_INTERFACEID_ERC1271, _ERC1271_MAGICVALUE, _ERC1271_FAILVALUE} from "../LSP0ERC725Account/LSP0Constants.sol";
import "./LSP6Constants.sol";

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

    address public override target;
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
    function getNonce(address from, uint256 channelId) public view override returns (uint256) {
        uint128 nonceId = uint128(_nonceStore[from][channelId]);
        return (uint256(channelId) << 128) | nonceId;
    }

    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(bytes32 dataHash, bytes memory signature)
        public
        view
        override
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
    function execute(bytes calldata payload) public payable override returns (bytes memory) {
        _verifyPermissions(msg.sender, payload);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = target.call{value: msg.value, gas: gasleft()}(
            payload
        );

        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }

        emit Executed(msg.value, bytes4(payload));
        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        bytes calldata payload
    ) public payable override returns (bytes memory) {
        bytes memory blob = abi.encodePacked(
            block.chainid,
            address(this), // needs to be signed for this keyManager
            nonce,
            payload
        );

        address signer = keccak256(blob).toEthSignedMessageHash().recover(signature);

        require(_isValidNonce(signer, nonce), "executeRelayCall: Invalid nonce");

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        _verifyPermissions(signer, payload);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result) = target.call{value: msg.value, gas: gasleft()}(
            payload
        );

        if (!success) {
            ErrorHandlerLib.revertWithParsedError(result);
        }

        emit Executed(msg.value, bytes4(payload));
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

        // prettier-ignore
        if (erc725Function == setDataSingleSelector) {

            (bytes32 inputKey, bytes memory inputValue) = abi.decode(payload[4:], (bytes32, bytes));

            if (
                // CHECK for permission keys
                bytes6(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX ||
                bytes16(inputKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX
            ) {

                _verifyCanSetPermissions(inputKey, inputValue, from, permissions);

            } else {

                bytes32[] memory wrappedInputKey = new bytes32[](1);
                wrappedInputKey[0] = inputKey;

                _verifyCanSetData(from, permissions, wrappedInputKey);
            }

        } else if (erc725Function == setDataMultipleSelector) {

            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi.decode(payload[4:], (bytes32[], bytes[]));

            bool isSettingERC725YKeys = false;
            
            // loop through each ERC725Y data keys
            for (uint256 ii = 0; ii < inputKeys.length; ii++) {
                bytes32 key = inputKeys[ii];
                bytes memory value = inputValues[ii];

                if (
                    // CHECK for permission keys
                    bytes6(key) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX ||
                    bytes16(key) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX
                ) {
                    _verifyCanSetPermissions(key, value, from, permissions);

                    // "nullify" permission keys
                    // to not check them against allowed ERC725Y keys
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
            erc725Function == IClaimOwnership.claimOwnership.selector
        ) {

            _requirePermissions(from, permissions, _PERMISSION_CHANGEOWNER);
    
        } else {
            revert("_verifyPermissions: invalid ERC725 selector");
        }
    }

    /**
     * @dev verify if `_from` has the required permissions to set some keys
     * on the linked ERC725Account
     * @param from the address who want to set the keys
     * @param permissions the permissions
     * @param inputKeys the data keys being set
     * containing a list of keys-value pairs
     */
    function _verifyCanSetData(
        address from,
        bytes32 permissions,
        bytes32[] memory inputKeys
    ) internal view {
        // Skip if caller has SUPER permissions
        if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

        _requirePermissions(from, permissions, _PERMISSION_SETDATA);

        _verifyAllowedERC725YKeys(from, inputKeys);
    }

    function _verifyCanSetPermissions(
        bytes32 key,
        bytes memory value,
        address from,
        bytes32 permissions
    ) internal view {
        // prettier-ignore
        if (bytes12(key) == _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX) {
            
            // key = AddressPermissions:Permissions:<address>
            _verifyCanSetBytes32Permissions(key, from, permissions);
        
        } else if (key == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {

            // key = AddressPermissions[]
            _verifyCanSetPermissionsArray(key, value, from, permissions);
        
        } else if (bytes16(key) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {

            // key = AddressPermissions[index]
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);

        } else if (bytes12(key) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDADDRESSES_PREFIX) {

            // AddressPermissions:AllowedAddresses:<address>
            require(
                LSP2Utils.isEncodedArrayOfAddresses(value),
                "LSP6KeyManager: invalid ABI encoded array of addresses"
            );

            bytes memory storedAllowedAddresses = ERC725Y(target).getData(key);

            if (storedAllowedAddresses.length == 0) {

                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);

            } else {

                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);

            }

        } else if (
            bytes12(key) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDFUNCTIONS_PREFIX ||
            bytes12(key) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDSTANDARDS_PREFIX
        ) {

            // AddressPermissions:AllowedFunctions:<address>
            // AddressPermissions:AllowedStandards:<address>
            require(
                LSP2Utils.isBytes4EncodedArray(value),
                "LSP6KeyManager: invalid ABI encoded array of bytes4"
            );

            bytes memory storedAllowedBytes4 = ERC725Y(target).getData(key);

            if (storedAllowedBytes4.length == 0) {

                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);

            } else {

                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);

            }

        } else if (bytes12(key) == _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDERC725YKEYS_PREFIX) {

            // AddressPermissions:AllowedERC725YKeys:<address>
            require(
                LSP2Utils.isEncodedArray(value),
                "LSP6KeyManager: invalid ABI encoded array of bytes32"
            );

            bytes memory storedAllowedERC725YKeys = ERC725Y(target).getData(key);

            if (storedAllowedERC725YKeys.length == 0) {

                _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);

            } else {

                _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);

            }

        }
    }

    function _verifyCanSetBytes32Permissions(
        bytes32 key,
        address from,
        bytes32 callerPermissions
    ) internal view {
        if (bytes32(ERC725Y(target).getData(key)) == bytes32(0)) {
            // if there is nothing stored under this data key,
            // we are trying to ADD permissions for a NEW address
            _requirePermissions(from, callerPermissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            // if there are already some permissions stored under this data key,
            // we are trying to CHANGE the permissions of an address
            // (that has already some EXISTING permissions set)
            _requirePermissions(from, callerPermissions, _PERMISSION_CHANGEPERMISSIONS);
        }
    }

    function _verifyCanSetPermissionsArray(
        bytes32 key,
        bytes memory value,
        address from,
        bytes32 permissions
    ) internal view {
        uint256 arrayLength = uint256(bytes32(ERC725Y(target).getData(key)));
        uint256 newLength = uint256(bytes32(value));

        if (newLength > arrayLength) {
            _requirePermissions(from, permissions, _PERMISSION_ADDPERMISSIONS);
        } else {
            _requirePermissions(from, permissions, _PERMISSION_CHANGEPERMISSIONS);
        }
    }

    function _verifyAllowedERC725YKeys(address from, bytes32[] memory inputKeys) internal view {
        bytes memory allowedERC725YKeysEncoded = ERC725Y(target).getAllowedERC725YKeysFor(from);

        // whitelist any ERC725Y key
        if (
            // if nothing in the list
            allowedERC725YKeysEncoded.length == 0 ||
            // if not correctly abi-encoded array
            !LSP2Utils.isEncodedArray(allowedERC725YKeysEncoded)
        ) return;

        bytes32[] memory allowedERC725YKeys = abi.decode(allowedERC725YKeysEncoded, (bytes32[]));

        uint256 zeroBytesCount;
        bytes32 mask;

        // loop through each allowed ERC725Y key retrieved from storage
        for (uint256 ii = 0; ii < allowedERC725YKeys.length; ii++) {
            // required to know which part of the input key to compare against the allowed key
            zeroBytesCount = _countTrailingZeroBytes(allowedERC725YKeys[ii]);

            // loop through each keys given as input
            for (uint256 jj = 0; jj < inputKeys.length; jj++) {
                // skip permissions keys that have been previously checked and "nulled"
                if (inputKeys[jj] == bytes32(0)) continue;

                // use a bitmask to discard the last `n` bytes of the input key (where `n` = `zeroBytesCount`)
                // and compare only the relevant parts of each ERC725Y keys
                //
                // for an allowed key = 0xcafecafecafecafecafecafecafecafe00000000000000000000000000000000
                //
                //                        |------compare this part-------|------discard this part--------|
                //                        v                              v                               v
                //               mask = 0xffffffffffffffffffffffffffffffff00000000000000000000000000000000
                //        & input key = 0xcafecafecafecafecafecafecafecafe00000000000000000000000011223344
                //
                mask = bytes32(type(uint256).max) << (8 * zeroBytesCount);

                if (allowedERC725YKeys[ii] == (inputKeys[jj] & mask)) {
                    // if the input key matches the allowed key
                    // make it null to mark it as allowed
                    inputKeys[jj] = bytes32(0);
                }
            }
        }

        for (uint256 ii = 0; ii < inputKeys.length; ii++) {
            if (inputKeys[ii] != bytes32(0)) revert NotAllowedERC725YKey(from, inputKeys[ii]);
        }
    }

    /**
     * @dev verify if `from` has the required permissions to make an external call
     * via the linked ERC725Account
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

        // TODO: if re-enable delegatecall, add check to ensure owner() + initialized() are not overriden after delegatecall
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

        if (isCallDataPresent) {
            // prettier-ignore
            hasSuperOperation || _requirePermissions(from, permissions, _extractPermissionFromOperation(operationType));
        }

        bool hasSuperTransferValue = permissions.hasPermission(_PERMISSION_SUPER_TRANSFERVALUE);

        if (value > 0) {
            // prettier-ignore
            hasSuperTransferValue || _requirePermissions(from, permissions, _PERMISSION_TRANSFERVALUE);
        }

        // Skip on contract creation (CREATE or CREATE2)
        if (isContractCreation) return;

        // Skip if caller has SUPER permissions for operations
        if (hasSuperOperation && isCallDataPresent && value == 0) return;

        // Skip if caller has SUPER permission for value transfers
        if (hasSuperTransferValue && !isCallDataPresent && value > 0) return;

        // Skip if both SUPER permissions are present
        if (hasSuperOperation && hasSuperTransferValue) return;

        // CHECK for ALLOWED ADDRESSES
        address to = address(bytes20(payload[48:68]));
        _verifyAllowedAddress(from, to);

        if (to.code.length > 0) {
            // CHECK for ALLOWED STANDARDS
            _verifyAllowedStandard(from, to);

            // CHECK for ALLOWED FUNCTIONS
            // extract bytes4 function selector from payload passed to ERC725X.execute(...)
            if (payload.length >= 168) _verifyAllowedFunction(from, bytes4(payload[164:168]));
        }
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
     * @dev verify if `from` is authorised to interact with address `to` via the linked ERC725Account
     * @param from the caller address
     * @param to the address to interact with
     */
    function _verifyAllowedAddress(address from, address to) internal view {
        bytes memory allowedAddresses = ERC725Y(target).getAllowedAddressesFor(from);

        // whitelist any address
        if (
            // if nothing in the list
            allowedAddresses.length == 0 ||
            // if not correctly abi-encoded array of address[]
            !LSP2Utils.isEncodedArrayOfAddresses(allowedAddresses)
        ) return;

        address[] memory allowedAddressesList = abi.decode(allowedAddresses, (address[]));

        for (uint256 ii = 0; ii < allowedAddressesList.length; ii++) {
            if (to == allowedAddressesList[ii]) return;
        }
        revert NotAllowedAddress(from, to);
    }

    /**
     * @dev if `from` is restricted to interact with contracts that implement a specific interface,
     * verify that `to` implements one of these interface.
     * @param from the caller address
     * @param to the address of the contract to interact with
     */
    function _verifyAllowedStandard(address from, address to) internal view {
        bytes memory allowedStandards = ERC725Y(target).getAllowedStandardsFor(from);

        // whitelist any standard interface (ERC165)
        if (
            // if nothing in the list
            allowedStandards.length == 0 ||
            // if not correctly abi-encoded array of bytes4[]
            !LSP2Utils.isBytes4EncodedArray(allowedStandards)
        ) return;

        bytes4[] memory allowedStandardsList = abi.decode(allowedStandards, (bytes4[]));

        for (uint256 ii = 0; ii < allowedStandardsList.length; ii++) {
            if (to.supportsERC165Interface(allowedStandardsList[ii])) return;
        }
        revert("Not Allowed Standards");
    }

    /**
     * @dev verify if `from` is authorised to use the linked ERC725Account
     * to run a specific function `functionSelector` at a target contract
     * @param from the caller address
     * @param functionSelector the bytes4 function selector of the function to run
     * at the target contract
     */
    function _verifyAllowedFunction(address from, bytes4 functionSelector) internal view {
        bytes memory allowedFunctions = ERC725Y(target).getAllowedFunctionsFor(from);

        // whitelist any function
        if (
            // if nothing in the list
            allowedFunctions.length == 0 ||
            // if not correctly abi-encoded array of bytes4[]
            !LSP2Utils.isBytes4EncodedArray(allowedFunctions)
        ) return;

        bytes4[] memory allowedFunctionsList = abi.decode(allowedFunctions, (bytes4[]));

        for (uint256 ii = 0; ii < allowedFunctionsList.length; ii++) {
            if (functionSelector == allowedFunctionsList[ii]) return;
        }
        revert NotAllowedFunction(from, functionSelector);
    }

    function _countTrailingZeroBytes(bytes32 key) internal pure returns (uint256) {
        uint256 index = 31;

        // CHECK each bytes of the key, starting from the end (right to left)
        // skip each empty bytes `0x00` to find the first non-empty byte
        while (key[index] == 0x00) index--;

        return 32 - (index + 1);
    }

    function _requirePermissions(
        address from,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure returns (bool) {
        if (!addressPermissions.hasPermission(permissionRequired)) {
            string memory permissionErrorString = _getPermissionErrorString(permissionRequired);
            revert NotAuthorised(from, permissionErrorString);
        }
    }

    function _getPermissionErrorString(bytes32 permission)
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
        // TODO: add support to display CREATE or CREATE2 in the revert error
        if (permission == _PERMISSION_DEPLOY) return "DEPLOY";
        if (permission == _PERMISSION_TRANSFERVALUE) return "TRANSFERVALUE";
        if (permission == _PERMISSION_SIGN) return "SIGN";
    }
}
