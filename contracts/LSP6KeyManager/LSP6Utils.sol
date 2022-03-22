// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "../LSP6KeyManager/LSP6Constants.sol";

// libraries
import "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "..//Utils/ERC725Utils.sol";
import "./ILSP6KeyManager.sol";

library LSP6Utils {
    using LSP2Utils for bytes12;
    using ERC725Utils for IERC725Y;

    function getPermissionsFor(IERC725Y _account, address _address)
        internal
        view
        returns (bytes32)
    {
        bytes memory permissions = _account.getDataSingle(
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
            _account.getDataSingle(
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
            _account.getDataSingle(
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _LSP6_ADDRESS_ALLOWEDFUNCTIONS_MAP_KEY_PREFIX,
                    bytes20(_address)
                )
            );
    }

    /**
     * TODO; rename + move to LSP6 library
     * @dev compare the permissions `_addressPermissions` of an address
     *      to check if they includes the permissions `_permissionToCheck`
     * @param _addressPermissions the permissions of an address stored on an ERC725 account
     * @param _permissionsToCheck the permissions to check
     * @return true if `_addressPermissions` includes `_permissionToCheck`, false otherwise
     */
    function includesPermissions(
        bytes32 _addressPermissions,
        bytes32 _permissionsToCheck
    ) internal pure returns (bool) {
        return
            (_addressPermissions & _permissionsToCheck) == _permissionsToCheck;
    }

    function setDataViaKeyManager(
        address keyManagerAddress,
        bytes32[] memory keys,
        bytes[] memory values
    ) internal returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(
            hex"14a6e293",
            keys,
            values
        );
        result = ILSP6KeyManager(keyManagerAddress).execute(payload);
    }
}
