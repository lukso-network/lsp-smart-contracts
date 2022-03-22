// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// interfaces
import "./ILSP6KeyManager.sol";

// libraries
import "./LSP6Utils.sol";

import "../Utils/ERC725Utils.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

// constants
import "./LSP6Constants.sol";
import "../LSP0ERC725Account/LSP0Constants.sol";
import "@erc725/smart-contracts/contracts/constants.sol";

/**
 * @dev revert when address `from` does not have any permissions set
 * on the account linked to this Key Manager
 * @param from the address that does not have permissions
 */
error NoPermissionsSet(address from);

/**
 * @dev address `from` is not authorised to `permission`
 * @param permission permission required
 * @param from address not-authorised
 */
error NotAuthorised(address from, string permission);

/**
 * @dev address `from` is not authorised to interact with `disallowedAddress` via account
 * @param from address making the request
 * @param disallowedAddress address that `from` is not authorised to call
 */
error NotAllowedAddress(address from, address disallowedAddress);

/**
 * @dev address `from` is not authorised to run `disallowedFunction` via account
 * @param from address making the request
 * @param disallowedFunction bytes4 function selector that `from` is not authorised to run
 */
error NotAllowedFunction(address from, bytes4 disallowedFunction);

/**
 * @dev address `from` is not authorised to set the key `disallowedKey` on the account
 * @param from address making the request
 * @param disallowedKey a bytes32 key that `from` is not authorised to set on the ERC725Y storage
 */
error NotAllowedERC725YKey(address from, bytes32 disallowedKey);

/**
 * @title Core implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller, Jean Cavallera
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerCore is ILSP6KeyManager, ERC165 {
    using ERC725Utils for ERC725Y;
    using LSP2Utils for ERC725Y;
    using LSP6Utils for *;
    using Address for address;
    using ECDSA for bytes32;
    using ERC165Checker for address;

    ERC725 public account;
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP6 ||
            interfaceId == _INTERFACEID_ERC1271 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function getNonce(address _from, uint256 _channel)
        public
        view
        override
        returns (uint256)
    {
        uint128 nonceId = uint128(_nonceStore[_from][_channel]);
        return (uint256(_channel) << 128) | nonceId;
    }

    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
        public
        view
        override
        returns (bytes4 magicValue)
    {
        address recoveredAddress = ECDSA.recover(_hash, _signature);
        return
            (_PERMISSION_SIGN & account.getPermissionsFor(recoveredAddress)) ==
                _PERMISSION_SIGN
                ? _INTERFACEID_ERC1271
                : _ERC1271_FAILVALUE;
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function execute(bytes calldata _data)
        external
        payable
        override
        returns (bytes memory)
    {
        _verifyPermissions(msg.sender, _data);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result_) = address(account).call{
            value: msg.value,
            gas: gasleft()
        }(_data);

        if (!success) {
            // solhint-disable reason-string
            if (result_.length < 68) revert();

            // solhint-disable no-inline-assembly
            assembly {
                result_ := add(result_, 0x04)
            }
            revert(abi.decode(result_, (string)));
        }

        emit Executed(msg.value, _data);
        return result_.length > 0 ? abi.decode(result_, (bytes)) : result_;
    }

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function executeRelayCall(
        address _signedFor,
        uint256 _nonce,
        bytes calldata _data,
        bytes memory _signature
    ) external payable override returns (bytes memory) {
        require(
            _signedFor == address(this),
            "executeRelayCall: Message not signed for this keyManager"
        );

        bytes memory blob = abi.encodePacked(
            address(this), // needs to be signed for this keyManager
            _nonce,
            _data
        );

        address signer = keccak256(blob).toEthSignedMessageHash().recover(
            _signature
        );

        require(
            _isValidNonce(signer, _nonce),
            "executeRelayCall: Invalid nonce"
        );

        // increase nonce after successful verification
        _nonceStore[signer][_nonce >> 128]++;

        _verifyPermissions(signer, _data);

        // solhint-disable avoid-low-level-calls
        (bool success, bytes memory result_) = address(account).call{
            value: 0,
            gas: gasleft()
        }(_data);

        if (!success) {
            // solhint-disable reason-string
            if (result_.length < 68) revert();

            // solhint-disable no-inline-assembly
            assembly {
                result_ := add(result_, 0x04)
            }
            revert(abi.decode(result_, (string)));
        }

        emit Executed(msg.value, _data);
        return result_.length > 0 ? abi.decode(result_, (bytes)) : result_;
    }

    /**
     * @notice verify the nonce `_idx` for `_from` (obtained via `getNonce(...)`)
     * @dev "idx" is a 256bits (unsigned) integer, where:
     *          - the 128 leftmost bits = channelId
     *      and - the 128 rightmost bits = nonce within the channel
     * @param _from caller address
     * @param _idx (channel id + nonce within the channel)
     */
    function _isValidNonce(address _from, uint256 _idx)
        internal
        view
        returns (bool)
    {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (_idx % (1 << 128)) == (_nonceStore[_from][_idx >> 128]);
    }

    /**
     * @dev verify the permissions of the _from address that want to interact with the `account`
     * @param _from the address making the request
     * @param _data the payload that will be run on `account`
     */
    function _verifyPermissions(address _from, bytes calldata _data)
        internal
        view
    {
        bytes4 erc725Function = _extractERC725Selector(_data);

        // get the permissions of the caller
        bytes32 permissions = account.getPermissionsFor(_from);
        if (permissions == bytes32(0)) revert NoPermissionsSet(_from);

        // skip permissions check if caller has all permissions (except SIGN as not required)
        bool isAdmin = permissions.includesPermissions(
            _ALL_EXECUTION_PERMISSIONS
        );
        if (isAdmin) return;

        if (erc725Function == account.setData.selector) {
            _verifyCanSetData(_from, permissions, _data);
        }

        if (erc725Function == account.execute.selector) {
            _verifyCanExecute(_from, permissions, _data);

            address to = address(bytes20(_data[48:68]));
            _verifyAllowedAddress(_from, to);

            if (to.code.length > 0) {
                _verifyAllowedStandard(_from, to);

                if (_data.length >= 168) {
                    // extract bytes4 function selector from payload passed to ERC725X.execute(...)
                    _verifyAllowedFunction(_from, bytes4(_data[164:168]));
                }
            }
        }

        if (erc725Function == account.transferOwnership.selector) {
            if (!permissions.includesPermissions(_PERMISSION_CHANGEOWNER))
                revert NotAuthorised(_from, "TRANSFEROWNERSHIP");
        }
    }

    /**
     * @dev verify if `_from` has the required permissions to set some keys
     * on the linked ERC725Account
     * @param _from the address who want to set the keys
     * @param _data the ABI encoded payload `account.setData(keys, values)`
     * containing a list of keys-value pairs
     */
    function _verifyCanSetData(
        address _from,
        bytes32 _permissions,
        bytes calldata _data
    ) internal view {
        (bytes32[] memory inputKeys, ) = abi.decode(
            _data[4:],
            (bytes32[], bytes[])
        );

        bool isSettingERC725YKeys = false;

        // loop through the keys we are trying to set
        for (uint256 ii = 0; ii < inputKeys.length; ii++) {
            bytes32 key = inputKeys[ii];

            // prettier-ignore
            // if the key is a permission key
            if (bytes8(key) == _SET_PERMISSIONS_PREFIX) {
                _verifyCanSetPermissions(key, _from, _permissions);

                // "nullify permission keys, 
                // so that they do not get check against allowed ERC725Y keys
                inputKeys[ii] = bytes32(0);

            // if the key is any other bytes32 key
            } else if (key == _LSP6_ADDRESS_PERMISSIONS_ARRAY_KEY) {
                if (!_permissions.includesPermissions(_PERMISSION_ADDPERMISSIONS))
                    revert NotAuthorised(_from, "ADDPERMISSIONS");
            } else {
                isSettingERC725YKeys = true;
            }
        }

        if (isSettingERC725YKeys) {
            if (!_permissions.includesPermissions(_PERMISSION_SETDATA))
                revert NotAuthorised(_from, "SETDATA");

            _verifyAllowedERC725YKeys(_from, inputKeys);
        }
    }

    function _verifyCanSetPermissions(
        bytes32 _key,
        address _from,
        bytes32 _callerPermissions
    ) internal view {
        // prettier-ignore
        // check if some permissions are already stored under this key
        if (bytes32(ERC725Y(account).getDataSingle(_key)) == bytes32(0)) {
            // if nothing is stored under this key,
            // we are trying to ADD permissions for a NEW address
            if (!_callerPermissions.includesPermissions(_PERMISSION_ADDPERMISSIONS))
                revert NotAuthorised(_from, "ADDPERMISSIONS");
        } else {
            // if there are already a value stored under this key,
            // we are trying to CHANGE the permissions of an address
            // (that has already some EXISTING permissions set)
            if (!_callerPermissions.includesPermissions(_PERMISSION_CHANGEPERMISSIONS)) 
                revert NotAuthorised(_from, "CHANGEPERMISSIONS");
        }
    }

    function _verifyAllowedERC725YKeys(
        address _from,
        bytes32[] memory _inputKeys
    ) internal view {
        bytes memory allowedERC725YKeysEncoded = ERC725Y(account).getDataSingle(
            LSP2Utils.generateBytes20MappingWithGroupingKey(
                _LSP6_ADDRESS_ALLOWEDERC725YKEYS_MAP_KEY_PREFIX,
                bytes20(_from)
            )
        );

        // whitelist any ERC725Y key if nothing in the list
        if (allowedERC725YKeysEncoded.length == 0) return;

        bytes32[] memory allowedERC725YKeys = abi.decode(
            allowedERC725YKeysEncoded,
            (bytes32[])
        );

        bytes memory allowedKeySlice;
        bytes memory inputKeySlice;
        uint256 sliceLength;

        bool isAllowedKey;

        // save the not allowed key for cusom revert error
        bytes32 notAllowedKey;

        // loop through each allowed ERC725Y key retrieved from storage
        for (uint256 ii = 0; ii < allowedERC725YKeys.length; ii++) {
            // save the length of the slice
            // so to know which part to compare for each key we are trying to set
            (allowedKeySlice, sliceLength) = _extractKeySlice(
                allowedERC725YKeys[ii]
            );

            // loop through each keys given as input
            for (uint256 jj = 0; jj < _inputKeys.length; jj++) {
                // skip permissions keys that have been "nulled" previously
                if (_inputKeys[jj] == bytes32(0)) continue;

                // extract the slice to compare with the allowed key
                inputKeySlice = BytesLib.slice(
                    bytes.concat(_inputKeys[jj]),
                    0,
                    sliceLength
                );

                isAllowedKey =
                    keccak256(allowedKeySlice) == keccak256(inputKeySlice);

                // if the keys match, the key is allowed so stop iteration
                if (isAllowedKey) break;

                // if the keys do not match, save this key as a not allowed key
                notAllowedKey = _inputKeys[jj];
            }

            // if after checking all the keys given as input we did not find any not allowed key
            // stop checking the other allowed ERC725Y keys
            if (isAllowedKey == true) break;
        }

        // we always revert with the last not-allowed key that we found in the keys given as inputs
        if (isAllowedKey == false)
            revert NotAllowedERC725YKey(_from, notAllowedKey);
    }

    /**
     * @dev verify if `_from` has the required permissions to make an external call
     * via the linked ERC725Account
     * @param _from the address who want to run the execute function on the ERC725Account
     * @param _data the ABI encoded payload `account.execute(...)`
     */
    function _verifyCanExecute(
        address _from,
        bytes32 _permissions,
        bytes calldata _data
    ) internal pure {
        uint256 operationType = uint256(bytes32(_data[4:36]));
        uint256 value = uint256(bytes32(_data[68:100]));

        require(
            operationType != 4,
            "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
        );

        (
            bytes32 permissionRequired,
            string memory operationName
        ) = _extractPermissionFromOperation(operationType);

        if (!_permissions.includesPermissions(permissionRequired))
            revert NotAuthorised(_from, operationName);

        if (
            (value > 0) &&
            !_permissions.includesPermissions(_PERMISSION_TRANSFERVALUE)
        ) {
            revert NotAuthorised(_from, "TRANSFERVALUE");
        }
    }

    /**
     * @dev verify if `_from` is authorised to interact with address `_to` via the linked ERC725Account
     * @param _from the caller address
     * @param _to the address to interact with
     */
    function _verifyAllowedAddress(address _from, address _to) internal view {
        bytes memory allowedAddresses = account.getAllowedAddressesFor(_from);

        // whitelist any address if nothing in the list
        if (allowedAddresses.length == 0) return;

        address[] memory allowedAddressesList = abi.decode(
            allowedAddresses,
            (address[])
        );

        for (uint256 ii = 0; ii < allowedAddressesList.length; ii++) {
            if (_to == allowedAddressesList[ii]) return;
        }
        revert NotAllowedAddress(_from, _to);
    }

    /**
     * @dev if `_from` is restricted to interact with contracts that implement a specific interface,
     * verify that `_to` implements one of these interface.
     * @param _from the caller address
     * @param _to the address of the contract to interact with
     */
    function _verifyAllowedStandard(address _from, address _to) internal view {
        bytes memory allowedStandards = ERC725Y(account).getDataSingle(
            LSP2Utils.generateBytes20MappingWithGroupingKey(
                _LSP6_ADDRESS_ALLOWEDSTANDARDS_MAP_KEY_PREFIX,
                bytes20(_from)
            )
        );

        // whitelist any standard interface (ERC165) if nothing in the list
        if (allowedStandards.length == 0) return;

        bytes4[] memory allowedStandardsList = abi.decode(
            allowedStandards,
            (bytes4[])
        );

        for (uint256 ii = 0; ii < allowedStandardsList.length; ii++) {
            if (_to.supportsInterface(allowedStandardsList[ii])) return;
        }
        revert("Not Allowed Standards");
    }

    /**
     * @dev verify if `_from` is authorised to use the linked ERC725Account
     * to run a specific function `_functionSelector` at a target contract
     * @param _from the caller address
     * @param _functionSelector the bytes4 function selector of the function to run
     * at the target contract
     */
    function _verifyAllowedFunction(address _from, bytes4 _functionSelector)
        internal
        view
    {
        bytes memory allowedFunctions = account.getAllowedFunctionsFor(_from);

        // whitelist any function if nothing in the list
        if (allowedFunctions.length == 0) return;

        bytes4[] memory allowedFunctionsList = abi.decode(
            allowedFunctions,
            (bytes4[])
        );

        for (uint256 ii = 0; ii < allowedFunctionsList.length; ii++) {
            if (_functionSelector == allowedFunctionsList[ii]) return;
        }
        revert NotAllowedFunction(_from, _functionSelector);
    }

    function _extractERC725Selector(bytes calldata _data)
        internal
        view
        returns (bytes4 selector_)
    {
        selector_ = bytes4(_data[:4]);

        // prettier-ignore
        require(
            selector_ == IERC725Y.setData.selector ||
            selector_ == IERC725X.execute.selector ||
            selector_ == account.transferOwnership.selector,
            "unknown ERC725 selector"
        );
    }

    function _extractKeySlice(bytes32 _key)
        internal
        pure
        returns (bytes memory keySlice_, uint256 sliceLength_)
    {
        // check each individual bytes of the allowed key, starting from the end (right to left)
        for (uint256 index = 31; index >= 0; index--) {
            // find where the first non-empty bytes starts (skip empty bytes 0x00)
            if (_key[index] != 0x00) {
                // stop as soon as we find a non-empty byte
                sliceLength_ = index + 1;
                keySlice_ = BytesLib.slice(bytes.concat(_key), 0, sliceLength_);
                break;
            }
        }
    }

    /**
     * @dev extract the required permission + a descriptive string, based on the `_operationType`
     * being run via ERC725Account.execute(...)
     * @param _operationType 0 = CALL, 1 = CREATE, 2 = CREATE2, etc... See ERC725X docs for more infos.
     * @return permissionsRequired_ (bytes32) the permission associated with the `_operationType`
     * @return operationName_ (string) the name of the opcode associated with `_operationType`
     */
    function _extractPermissionFromOperation(uint256 _operationType)
        internal
        pure
        returns (bytes32 permissionsRequired_, string memory operationName_)
    {
        require(_operationType < 5, "LSP6KeyManager: invalid operation type");

        if (_operationType == 0) return (_PERMISSION_CALL, "CALL");
        if (_operationType == 1) return (_PERMISSION_DEPLOY, "CREATE");
        if (_operationType == 2) return (_PERMISSION_DEPLOY, "CREATE2");
        if (_operationType == 3) return (_PERMISSION_STATICCALL, "STATICCALL");
    }
}
