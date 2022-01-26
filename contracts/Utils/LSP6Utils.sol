// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "../LSP6KeyManager/LSP6Constants.sol";

// libraries
import "../Utils/LSP2Utils.sol";
import "..//Utils/ERC725Utils.sol";

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
                _ADDRESS_PERMISSIONS,
                bytes20(_address)
            )
        );

        if (bytes32(permissions) == bytes32(0)) {
            revert(
                "LSP6Utils:getPermissionsFor: no permissions set for this address"
            );
        }

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
                    _ADDRESS_ALLOWEDADDRESSES,
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
                    _ADDRESS_ALLOWEDFUNCTIONS,
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
            _account.getDataSingle(
                LSP2Utils.generateBytes20MappingWithGroupingKey(
                    _ADDRESS_ALLOWEDSTANDARDS,
                    bytes20(_address)
                )
            );
    }
}
