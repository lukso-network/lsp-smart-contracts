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
            LSP2Utils.generateBytes20MappingWithGroupingKey(
                _LSP6_ADDRESS_PERMISSIONS_MAP_KEY_PREFIX,
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
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _LSP6_ADDRESS_ALLOWEDADDRESSES_MAP_KEY_PREFIX,
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
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _LSP6_ADDRESS_ALLOWEDFUNCTIONS_MAP_KEY_PREFIX,
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
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _LSP6_ADDRESS_ALLOWEDERC725YKEYS_MAP_KEY_PREFIX,
                    bytes20(_address)
                )
            );
    }

    /**
     * @dev compare the permissions `_addressPermissions` of an address
     *      to check if they includes the permissions `_permissionToCheck`
     * @param _addressPermissions the permissions of an address stored on an ERC725 account
     * @param _permissionsToCheck the permissions to check
     * @return true if `_addressPermissions` includes `_permissionToCheck`, false otherwise
     */
    function includesPermissions(bytes32 _addressPermissions, bytes32 _permissionsToCheck)
        internal
        pure
        returns (bool)
    {
        return (_addressPermissions & _permissionsToCheck) == _permissionsToCheck;
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
