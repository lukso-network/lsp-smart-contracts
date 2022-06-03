// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP6KeyManager} from "./ILSP6KeyManager.sol";

// libraries
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";

// constants
import "../LSP6KeyManager/LSP6Constants.sol";

library LSP6Utils {
    using LSP2Utils for bytes12;

    function getPermissionsFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes32)
    {
        bytes memory permissions = _account.getData(
            LSP2Utils.generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(_address)
            )
        );

        return bytes32(permissions);
    }

    function getAllowedAddressesFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes memory)
    {
        return
            _account.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDADDRESSES_PREFIX,
                    bytes20(_address)
                )
            );
    }

    function getAllowedFunctionsFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes memory)
    {
        return
            _account.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDFUNCTIONS_PREFIX,
                    bytes20(_address)
                )
            );
    }

    function getAllowedStandardsFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes memory)
    {
        return
            _account.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDSTANDARDS_PREFIX,
                    bytes20(_address)
                )
            );
    }

    function getAllowedERC725YKeysFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes memory)
    {
        return
            _account.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDERC725YKEYS_PREFIX,
                    bytes20(_address)
                )
            );
    }

    /**
     * @dev compare the permissions `_addressPermissions` of an address
     *      to check if they includes the permissions `_permissionToCheck`
     * @param _addressPermission the permissions of an address stored on an ERC725 account
     * @param _permissionToCheck the permissions to check
     * @return true if `_addressPermissions` includes `_permissionToCheck`, false otherwise
     */
    function hasPermission(bytes32 _addressPermission, bytes32 _permissionToCheck)
        internal
        pure
        returns (bool)
    {
        return (_addressPermission & _permissionToCheck) == _permissionToCheck;
    }

    function setDataViaKeyManager(
        address keyManagerAddress,
        bytes32[] memory keys,
        bytes[] memory values
    ) internal returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(hex"14a6e293", keys, values);
        result = ILSP6KeyManager(keyManagerAddress).execute(payload);
    }
}
