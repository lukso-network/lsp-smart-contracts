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

    function setupPermissions(
        IERC725Y _account,
        address _address,
        bytes memory permissions
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        bytes memory rawArrayLength = ERC725Utils.getDataSingle(
            _account,
            _LSP6_ADDRESS_PERMISSIONS_ARRAY_KEY
        );

        keys[0] = _LSP6_ADDRESS_PERMISSIONS_ARRAY_KEY;
        keys[2] = _LSP6_ADDRESS_PERMISSIONS_MAP_KEY_PREFIX
            .generateBytes20MappingWithGroupingKey(bytes20(_address));

        values[1] = UtilsLib.addressToBytes(_address);
        values[2] = permissions;

        if (rawArrayLength.length != 32) {
            keys[1] = LSP2Utils.generateArrayKeyAtIndex(
                _LSP6_ADDRESS_PERMISSIONS_ARRAY_KEY,
                0
            );

            values[0] = abi.encodePacked(uint256(1));
        } else if (rawArrayLength.length == 32) {
            uint256 arrayLength = abi.decode(rawArrayLength, (uint256));
            uint256 newArrayLength = arrayLength + 1;

            keys[1] = LSP2Utils.generateArrayKeyAtIndex(
                _LSP6_ADDRESS_PERMISSIONS_ARRAY_KEY,
                arrayLength
            );

            values[0] = UtilsLib.uint256ToBytes(newArrayLength);
        }
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
