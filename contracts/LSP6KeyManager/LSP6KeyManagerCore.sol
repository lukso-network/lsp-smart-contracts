// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// interfaces
import "./ILSP6KeyManager.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@erc725/smart-contracts/contracts/utils/ERC725Utils.sol";
import "../Utils/LSP2Utils.sol";

// constants
import "./LSP6Constants.sol";
import "@erc725/smart-contracts/contracts/constants.sol";

/**
 * @title Contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller, Jean Cavallera
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerCore is ILSP6KeyManager, ERC165Storage {
    using ECDSA for bytes32;
    using ERC725Utils for ERC725Y;

    ERC725 public account;
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    /* solhint-disable */
    // selectors
    bytes4 internal immutable _SETDATA_SELECTOR = account.setData.selector; // 0x14a6e293
    bytes4 internal immutable _EXECUTE_SELECTOR = account.execute.selector; // 0x44c028fe
    bytes4 internal immutable _TRANSFEROWNERSHIP_SELECTOR = account.transferOwnership.selector; // 0xf2fde38b;

    /* solhint-enable */

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage)
        returns (bool)
    {
        return interfaceId == _INTERFACE_ID_ERC1271 || super.supportsInterface(interfaceId);
    }

    /**
     * Get latest nonce for `_from` in a specific channel (`_channelId`)
     *
     * @param _from caller address
     * @param _channel channel id
     */
    function getNonce(address _from, uint256 _channel) public view override returns (uint256) {
        uint128 nonceId = uint128(_nonceStore[_from][_channel]);
        return (uint256(_channel) << 128) | nonceId;
    }

    /**
     * @dev "idx" is a 256bits (unsigned) integer, where:
     *          - the 128 leftmost bits = channelId
     *      and - the 128 rightmost bits = nonce within the channel
     * @param _from caller address
     * @param _idx (channel id + nonce within the channel)
     */
    function _verifyNonce(address _from, uint256 _idx) internal view returns (bool) {
        // idx % (1 << 128) = nonce
        // (idx >> 128) = channel
        // equivalent to: return (nonce == _nonceStore[_from][channel]
        return (_idx % (1 << 128)) == (_nonceStore[_from][_idx >> 128]);
    }

    /**
     * @notice Checks if an owner signed `_data`.
     * ERC1271 interface.
     *
     * @param _hash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
     * @param _signature owner's signature(s) of the data
     */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
        public
        view
        override
        returns (bytes4 magicValue)
    {
        address recoveredAddress = ECDSA.recover(_hash, _signature);
        return
            (_PERMISSION_SIGN & _getUserPermissions(recoveredAddress)) == _PERMISSION_SIGN
                ? _INTERFACE_ID_ERC1271
                : _ERC1271FAILVALUE;
    }

    /**
     * @dev execute the payload _data on the ERC725 Account
     * @param _data obtained via encodeABI() in web3
     * @return result_ the data being returned by the ERC725 Account
     */
    function execute(bytes calldata _data) external payable override returns (bytes memory) {
        _checkPermissions(msg.sender, _data);
        (bool success, bytes memory result_) = address(account).call{
            value: msg.value,
            gas: gasleft()
        }(_data);

        if (!success) {
            /* solhint-disable */
            if (result_.length < 68) revert();
            assembly {
                result_ := add(result_, 0x04)
            }
            revert(abi.decode(result_, (string)));
            /* solhint-enable */
        }

        emit Executed(msg.value, _data);
        return result_.length > 0 ? abi.decode(result_, (bytes)) : result_;
    }

    /**
     * @dev allows anybody to execute given they have a signed message from an executor
     * @param _signedFor this KeyManager
     * @param _nonce the address' nonce (in a specific `_channel`), obtained via `getNonce(...)`. Used to prevent replay attack
     * @param _data obtained via encodeABI() in web3
     * @param _signature bytes32 ethereum signature
     * @return result_ the data being returned by the ERC725 Account
     */
    function executeRelayCall(
        address _signedFor,
        uint256 _nonce,
        bytes calldata _data,
        bytes memory _signature
    ) external payable override returns (bytes memory) {
        require(
            _signedFor == address(this),
            "KeyManager:executeRelayCall: Message not signed for this keyManager"
        );

        bytes memory blob = abi.encodePacked(
            address(this), // needs to be signed for this keyManager
            _nonce,
            _data
        );

        address from = keccak256(blob).toEthSignedMessageHash().recover(_signature);

        require(_verifyNonce(from, _nonce), "KeyManager:executeRelayCall: Incorrect nonce");

        // increase nonce after successful verification
        _nonceStore[from][_nonce >> 128]++;

        _checkPermissions(from, _data);

        (bool success, bytes memory result_) = address(account).call{value: 0, gas: gasleft()}(
            _data
        );

        if (!success) {
            /* solhint-disable */
            if (result_.length < 68) revert();
            assembly {
                result_ := add(result_, 0x04)
            }
            revert(abi.decode(result_, (string)));
            /* solhint-enable */
        }

        emit Executed(msg.value, _data);
        return result_.length > 0 ? abi.decode(result_, (bytes)) : result_;
    }

    function _checkPermissions(address _address, bytes calldata _data) internal view {
        bytes32 userPermissions = _getUserPermissions(_address);
        bytes4 erc725Selector = bytes4(_data[:4]);

        if (erc725Selector == _SETDATA_SELECTOR) {
            _canSetData(userPermissions, _data);
        } else if (erc725Selector == _EXECUTE_SELECTOR) {
            uint256 operationType = uint256(bytes32(_data[4:36]));
            address recipient = address(bytes20(_data[48:68]));
            uint256 value = uint256(bytes32(_data[68:100]));

            _canExecute(operationType, value, userPermissions);

            require(
                _isAllowedAddress(_address, recipient),
                "KeyManager:_checkPermissions: Not authorized to interact with this address"
            );

            if (_data.length > 164) {
                bytes4 functionSelector = bytes4(_data[164:168]);
                if (functionSelector != 0x00000000) {
                    require(
                        _isAllowedFunction(_address, functionSelector),
                        "KeyManager:_checkPermissions: Not authorised to run this function"
                    );
                }
            }
        } else if (erc725Selector == _TRANSFEROWNERSHIP_SELECTOR) {
            require(
                _hasPermission(_PERMISSION_CHANGEOWNER, userPermissions),
                "KeyManager:_checkPermissions: Not authorized to transfer ownership"
            );
        } else {
            revert("KeyManager:_checkPermissions: unknown function selector on ERC725 account");
        }
    }

    function _getUserPermissions(address _address) internal view returns (bytes32) {
        bytes memory fetchResult = ERC725Y(account).getDataSingle(
            LSP2Utils.generateBytes20MappingWithGroupingKey(_ADDRESS_PERMISSIONS, bytes20(_address))
        );

        if (fetchResult.length == 0) {
            revert("KeyManager:_getUserPermissions: no permissions set for this user / caller");
        }

        bytes32 storedPermission;
        // solhint-disable-next-line
        assembly {
            storedPermission := mload(add(fetchResult, 32))
        }

        return storedPermission;
    }

    function _isAllowedAddress(address _sender, address _recipient) internal view returns (bool) {
        bytes memory allowedAddresses = ERC725Y(account).getDataSingle(
            LSP2Utils.generateBytes20MappingWithGroupingKey(
                _ADDRESS_ALLOWEDADDRESSES,
                bytes20(_sender)
            )
        );

        if (allowedAddresses.length == 0) {
            return true;
        } else {
            address[] memory allowedAddressesList = abi.decode(allowedAddresses, (address[]));
            if (allowedAddressesList.length == 0) {
                return true;
            } else {
                for (uint256 ii = 0; ii <= allowedAddressesList.length - 1; ii++) {
                    if (_recipient == allowedAddressesList[ii]) return true;
                }
                return false;
            }
        }
    }

    function _isAllowedFunction(address _sender, bytes4 _function) internal view returns (bool) {
        bytes memory allowedFunctions = ERC725Y(account).getDataSingle(
            LSP2Utils.generateBytes20MappingWithGroupingKey(
                _ADDRESS_ALLOWEDFUNCTIONS,
                bytes20(_sender)
            )
        );

        if (allowedFunctions.length == 0) {
            return true;
        } else {
            bytes4[] memory allowedFunctionsList = abi.decode(allowedFunctions, (bytes4[]));
            if (allowedFunctionsList.length == 0) {
                return true;
            } else {
                for (uint256 ii = 0; ii <= allowedFunctionsList.length - 1; ii++) {
                    if (_function == allowedFunctionsList[ii]) return true;
                }
                return false;
            }
        }
    }

    function _canSetData(bytes32 _executorPermissions, bytes calldata _data) internal view {
        uint256 keyCount = uint256(bytes32(_data[68:100]));

        // loop through the keys
        for (uint256 ii = 0; ii <= keyCount - 1; ii++) {
            // move calldata pointers
            uint256 ptrStart = 100 + (32 * ii);
            uint256 ptrEnd = (100 + (32 * (ii + 1)) - 1);

            // extract the key
            bytes32 setDataKey = bytes32(_data[ptrStart:ptrEnd]);

            // check if we try to change permissions
            if (bytes8(setDataKey) == _SET_PERMISSIONS) {
                bool isNewAddress = ERC725Y(account).getDataSingle(setDataKey).length == 0;

                isNewAddress
                    ? require(
                        _hasPermission(_PERMISSION_ADDPERMISSIONS, _executorPermissions),
                        "Not authorized to set permissions for new addresses"
                    )
                    : require(
                        _hasPermission(_PERMISSION_CHANGEPERMISSIONS, _executorPermissions),
                        "KeyManager:_checkPermissions: Not authorized to edit permissions of existing addresses"
                    );
            } else {
                require(
                    _hasPermission(_PERMISSION_SETDATA, _executorPermissions),
                    "KeyManager:_checkPermissions: Not authorized to setData"
                );
            }
        }
    }

    function _canExecute(
        uint256 _operationType,
        uint256 _value,
        bytes32 _userPermissions // bytes calldata _data
    ) internal pure {
        require(_operationType != 4, "Operation 4 `DELEGATECALL` not supported.");

        require(
            _operationType < 5, // Check for CALL, DEPLOY or STATICCALL
            "KeyManager:_checkPermissions: Invalid operation type"
        );

        if (_operationType == 0) {
            require(
                _hasPermission(_PERMISSION_CALL, _userPermissions),
                "KeyManager:_checkPermissions: not authorized to perform CALL"
            );
        }

        if (_operationType == 1 || _operationType == 2) {
            require(
                _hasPermission(_PERMISSION_DEPLOY, _userPermissions),
                "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
            );
        }

        if (_operationType == 3) {
            require(
                _hasPermission(_PERMISSION_STATICCALL, _userPermissions),
                "KeyManager:_checkPermissions: not authorized to perform STATICCALL"
            );
        }

        if (_value > 0) {
            require(
                _hasPermission(_PERMISSION_TRANSFERVALUE, _userPermissions),
                "KeyManager:_checkPermissions: Not authorized to transfer value"
            );
        }
    }

    function _hasPermission(bytes32 _permission, bytes32 _addressPermission)
        internal
        pure
        returns (bool)
    {
        bytes32 resultCheck = _permission & _addressPermission;

        if (resultCheck == _permission) {
            return true;
        } else {
            return false;
        }
    }
}
